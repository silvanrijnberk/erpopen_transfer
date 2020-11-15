import cherrypy
import uuid
import msal
SESSION_KEY = 'username'

CLIENT_ID = "23e1227b-4987-475f-b7a3-f49c73d0f02a" 

CLIENT_SECRET = "1Teixg~uy6b4_1qD9.But2M9u~3Un.kek." # Placeholder - for use ONLY during testing.
# In a production app, we recommend you use a more secure method of storing your secret,
# like Azure Key Vault. Or, use an environment variable as described in Flask's documentation:
# https://flask.palletsprojects.com/en/1.1.x/config/#configuring-from-environment-variables
# CLIENT_SECRET = os.getenv("CLIENT_SECRET")
# if not CLIENT_SECRET:
#     raise ValueError("Need to define CLIENT_SECRET environment variable")

AUTHORITY = "https://login.microsoftonline.com/f1d1f721-7267-4c90-bb8e-a608819634f8"  

REDIRECT_PATH = "/getAToken"  

ENDPOINT = 'https://graph.microsoft.com/v1.0/users'  


SCOPE = ["User.ReadBasic.All"]

SESSION_TYPE = "filesystem"  



def check_auth(*args, **kwargs):
    """A tool that looks in config for 'auth.require'. If found and it
    is not None, a login is required and the entry is evaluated as a list of
    conditions that the user must fulfill"""
    conditions = cherrypy.request.config.get('auth.require', None)
    if conditions is not None:
        username = cherrypy.session.get(SESSION_KEY)
        if username:
            cherrypy.request.login = username
            for condition in conditions:
                # A condition is just a callable that returns true or false
                if not condition():
                    raise cherrypy.HTTPRedirect("/signin")
        else:
            raise cherrypy.HTTPRedirect("/signin")


cherrypy.tools.auth = cherrypy.Tool('before_handler', check_auth)


def require(*conditions):
    """A decorator that appends conditions to the auth.require config
    variable."""

    def decorate(f):
        if not hasattr(f, '_cp_config'):
            f._cp_config = dict()
        if 'auth.require' not in f._cp_config:
            f._cp_config['auth.require'] = []
        f._cp_config['auth.require'].extend(conditions)

        return f

    return decorate




def member_of(groupname):
    def check():
        import psycopg2
        conn = psycopg2.connect(
            host='localhost',
            database='user_config',
            user='postgres',
            password='testtest')
        cur = conn.cursor()
        s = ""
        s += "SELECT"
        s += " role"
        s += " FROM"
        s += " user_data"
        s += " WHERE"
        s += " username='" + cherrypy.request.login + "'"
        cur.execute(s)
        res = cur.fetchall()
        conn.close()
        return groupname == res[0][0]

    return check


def name_is(reqd_username):
    return lambda: reqd_username == cherrypy.request.login



def any_of(*conditions):
    """Returns True if any of the conditions match"""

    def check():
        for c in conditions:
            if c():
                return True
        return False

    return check


def all_of(*conditions):
    """Returns True if all of the conditions match"""

    def check():
        for c in conditions:
            if not c():
                return False
        return True

    return check


def _load_cache():
    cache = msal.SerializableTokenCache()
    if cherrypy.session.cache.get("token_cache"):
        cache.deserialize(cherrypy.session.cache["token_cache"])
    return cache

def _save_cache(cache):
    if cache.has_state_changed:
        cherrypy.session.cache["token_cache"] = cache.serialize()



class AuthController(object):

    def on_login(self, username):
        import psycopg2
        conn = psycopg2.connect(
            host='localhost',
            database='user_config',
            user='postgres',
            password='testtest')
        cur = conn.cursor()
        s = ""
        s += "SELECT"
        s += " username"
        s += " FROM"
        s += " user_data"
        s += " WHERE"
        s += " username='" + cherrypy.request.login + "'"
        cur.execute(s)
        res = cur.fetchall()
        if len(res)>0:
            conn.close()
            return
        s = ""
        s += "INSERT INTO user_data(username, name)"
        s += " VALUES ('" + cherrypy.request.login + "', '" + cherrypy.session['user']['name'] + "');"
        cur.execute(s)
        conn.commit()
        conn.close()

    def on_logout(self, username):
        return

    @cherrypy.expose
    def signin(self):
        raise cherrypy.HTTPRedirect("/signin")

    @cherrypy.expose
    def login(self):
        print('login')
        cherrypy.session.regenerate()
        cherrypy.session["state"] = str(uuid.uuid4())
        auth_url = msal.ConfidentialClientApplication(
            CLIENT_ID, authority=AUTHORITY,
            client_credential=CLIENT_SECRET, token_cache=None).get_authorization_request_url(
            SCOPE,
            state=cherrypy.session["state"],
            redirect_uri= cherrypy.url("/auth/getAToken"))
        raise cherrypy.HTTPRedirect(auth_url)

    @cherrypy.expose
    def logout(self):
        username=cherrypy.request.login
        sess = cherrypy.session
        username = sess.get(SESSION_KEY, None)
        if username:
            cherrypy.request.login = None
            sess[SESSION_KEY] = None
            self.on_logout(username)

    @cherrypy.expose
    def getAToken(self, code ,session_state, state):
        cache = _load_cache()
        result = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY,client_credential=CLIENT_SECRET, token_cache=cache).acquire_token_by_authorization_code(
            code,
            scopes=SCOPE,
            redirect_uri=cherrypy.url("/auth/getAToken"))
        cherrypy.session.regenerate()
        cherrypy.session['user'] =  result.get("id_token_claims")
        cherrypy.session[SESSION_KEY] =  result.get("id_token_claims").get('preferred_username')
        cherrypy.session['acces_token'] = result.get("acces_token")
        cherrypy.request.login = result.get("id_token_claims").get('preferred_username')
        _save_cache(cache)
        self.on_login(cherrypy.request.login)
        raise cherrypy.HTTPRedirect("/")
