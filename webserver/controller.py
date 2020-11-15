import hashlib
from cherrypy.lib import auth_digest
import datetime
import json
import os
import os.path
import shutil
import subprocess
from hashlib import md5
import cherrypy
import git
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import cherrypy
from auth import AuthController, require, member_of, name_is


class pages(object):

    @cherrypy.expose
    @require()
    def index(self):
        return open(getPath('static/html/homePage.html'))

    @cherrypy.expose
    @require()
    def selectHostTransfer(self):
        return open(getPath('static/html/selectHostTransfer.html'))

    @cherrypy.expose
    @require()
    def selectHostTemplate(self):
        return open(getPath('static/html/selectHostTemplate.html'))

    @cherrypy.expose
    @require()
    def selectEnvironment(self):
        return open(getPath('static/html/selectEnvironment.html'))

    @cherrypy.expose
    @require()
    def editDatabase(self):
        return open(getPath('static/html/editDatabase.html'))

    @cherrypy.expose
    @require()
    def overview(self):
        return open(getPath('static/html/overview.html'))

    @cherrypy.expose
    @require()
    def history(self):
        return open(getPath('static/html/history.html'))

    @cherrypy.expose
    @require()
    def users(self):
        return open(getPath('static/html/userPage.html'))

    @cherrypy.expose
    @require()
    def companies(self):
        print(os.path.abspath(os.getcwd()))
        return open(getPath('static/html/companiePage.html'))

    @cherrypy.expose
    def signin(self):

        return open(getPath('static/html/signinPage.html'))

def getPath(myfile):
        import os
        THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
        my_file = os.path.join(THIS_FOLDER, myfile)
        return my_file

def get_databases(json_config):
    conn = get_connection(json_config)
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " datname"
    s += " FROM"
    s += " pg_database"
    s += " WHERE"
    s += " datname NOT LIKE 'postgres' or datname NOT LIKE '%test' "
    cur.execute(s)
    res = cur.fetchall()
    conn.close()
    return res


def save_user_data(json_config):
    if 'user_settings' not in json_config.keys():
        return
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = "UPDATE user_data"
    s += " SET"
    s += " user_settings = '" + \
        json.dumps(json_config['user_settings'])+"', last_online = DEFAULT"
    s += " WHERE"
    s += " username='"+json_config['user']+"'"
    cur.execute(s)
    conn.commit()
    conn.close()
    return json_config


def get_user_data(json_config):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " role, create_date, user_settings"
    s += " FROM"
    s += " user_data"
    s += " WHERE"
    s += " username='"+json_config['user']+"'"
    cur.execute(s)
    res = cur.fetchall()
    conn.close()
    json_config['create_date'] = res[0][1].strftime("%m/%d/%Y")
    json_config['role'] = res[0][0]
    json_config['user_settings'] = res[0][2]
    return json_config


def get_companies():
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = "SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'companies'"
    cur.execute(s)
    res = cur.fetchall()
    table_names = []
    for name in res:
        table_names.append(name[0])
    s = ""
    s += "SELECT"
    s += " *"
    s += " FROM"
    s += " companies"
    cur.execute(s)
    res = cur.fetchall()
    conn.close()
    companies = []
    for c in res:
        companie = {}
        count = 0
        for data in c:
            companie[table_names[count]] = data
            count += 1
        companies.append(companie)
    res = {}
    res['companies'] = companies
    return res


def set_companie(json_req):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "UPDATE"
    s += " companies"
    s += " SET"
    for key in json_req:
        if key != "id":
            s += " "+key+"='"+json_req[key]+"',"
    s = s[:-1]
    s += " WHERE"
    s += " id="+json_req['id']
    cur.execute(s)
    conn.commit()
    conn.close()


def save_companie(json_req):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "INSERT INTO"
    s += " companies ("
    for key in json_req:
        if key != "id":
            s += " "+key+","
    s = s[:-1]
    s += ") "
    s += " VALUES ("
    for key in json_req:
        if key != "id":
            s += " '"+json_req[key]+"',"
    s = s[:-1]
    s += "); "
    cur.execute(s)
    conn.commit()
    conn.close()


def delete_company(company_id):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = "DELETE"
    s += " FROM"
    s += " companies"
    s += " WHERE"
    s += " id="+str(company_id)
    cur.execute(s)
    conn.commit()
    conn.close()
    return


def set_role(username, role):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "UPDATE"
    s += " user_data"
    s += " SET"
    s += " role='"+role+"'"
    s += " WHERE"
    s += " username='"+username+"'"
    cur.execute(s)
    conn.commit()
    conn.close()


def get_users_data():
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " us.username, us.create_date, us.role, t.date, us.last_online "
    s += " FROM"
    s += " user_data us, transfers t"
    s += " WHERE"
    s += " t.username=us.username and date = (SELECT MAX(date) FROM transfers t1 WHERE t1.username = us.username)"
    cur.execute(s)
    res = cur.fetchall()
    users = []
    for u in res:
        user = {}
        user['username'] = u[0]
        user['create_date'] = u[1].strftime("%m/%d/%Y")
        user['role'] = u[2]
        user['last_transfer'] = u[3].strftime("%m/%d/%Y %H:%M:%S")
        user['last_online'] = u[4].strftime("%m/%d/%Y %H:%M:%S")
        users.append(user)
    s = ""
    s += "SELECT"
    s += " us.username, us.create_date, us.role, us.last_online "
    s += " FROM"
    s += " user_data us "
    s += " WHERE  NOT EXISTS (SELECT username FROM transfers t where us.username = t.username)"
    s += " "
    cur.execute(s)
    res = cur.fetchall()
    for u in res:
        user = {}
        user['username'] = u[0]
        user['create_date'] = u[1].strftime("%m/%d/%Y")
        user['role'] = u[2]
        user['last_transfer'] = "no transfers made"
        user['last_online'] = u[3].strftime("%m/%d/%Y %H:%M:%S")
        users.append(user)
    conn.close()
    res_json = {}
    res_json['users'] = users
    return res_json


def get_transfers(username):
    role = get_user_data({'user': cherrypy.request.login})['role']
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " id, date, username, config_json"
    s += " FROM"
    s += " transfers"
    if role != 'admin':
        s += " WHERE"
        s += " username='"+username+"'"
    s += " ORDER BY date DESC"
    cur.execute(s)
    res = cur.fetchall()
    conn.close()
    transfers = []
    for transfer in res:
        json_transfer = {}
        json_transfer['id'] = transfer[0]
        json_transfer['time'] = transfer[1].strftime("%H:%M:%S")
        json_transfer['date'] = transfer[1].strftime("%m/%d/%Y")
        json_transfer['username'] = transfer[2]
        json_transfer['config_json'] = transfer[3]
        transfers.append(json_transfer)
    json_res = {"transfers": transfers}
    return json_res


def get_templates(user, role):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " *"
    s += " FROM"
    s += " template"
    if role != 'admin':
        s += " WHERE"
        s += " owner='"+user+"' or owner='public'"
    cur.execute(s)
    res = cur.fetchall()
    conn.close()
    templates = []
    for t in res:
        json_template = {}
        json_template['id'] = t[0]
        json_template['owner'] = t[1]
        json_template['config_json'] = t[2]
        json_template['name'] = t[3]
        templates.append(json_template)
    res = {}
    res['templates'] = templates
    return res


def get_template(template_id):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " *"
    s += " FROM"
    s += " template"
    s += " WHERE"
    s += " id="+str(template_id)
    cur.execute(s)
    res = cur.fetchone()
    conn.close()
    json = {}
    json['id'] = res[0]
    json['owner'] = res[1]
    json['config_json'] = res[2]
    json['name'] = res[3]
    return json


def delete_template(template_id):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = "DELETE"
    s += " FROM"
    s += " template"
    s += " WHERE"
    s += " id="+str(template_id)
    cur.execute(s)
    conn.commit()
    conn.close()
    return


def get_databases_size(json_data, database):
    conn = get_connection(json_data)
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " pg_size_pretty( pg_database_size('" + database + "') );"
    cur.execute(s)
    res = cur.fetchall()
    conn.close()
    return res


def get_users(json_config):
    conn = get_connection(json_config)
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " usename "
    s += " FROM"
    s += " pg_catalog.pg_user"
    cur.execute(s)
    res = cur.fetchall()
    conn.close()
    return res


def get_tables(json_config):
    conn = get_connection_to_db(
        json_config, json_config['config']['database_p'])
    cur = conn.cursor()
    s = ""
    s += "SELECT"
    s += " c.relname"
    s += " FROM"
    s += " pg_class c"
    s += " INNER JOIN pg_namespace n ON (n.oid = c.relnamespace)"
    s += " WHERE NOT c.reltuples = 0 AND c.relkind = 'r'"
    s += "ORDER BY c.relname ASC"
    cur.execute(s)
    res = cur.fetchall()
    conn.close()
    return res


def get_type(cur, table, column):
    s = ""
    s += "SELECT"
    s += " data_type"
    s += " FROM"
    s += " information_schema.columns"
    s += " WHERE TABLE_NAME ="
    s += " '" + table + "'"
    s += " AND "
    s += "column_name='" + column + "'"
    cur.execute(s)
    res = cur.fetchone()
    return res


def get_rows(json_config):
    exclude = ["create_uid", "create_date", "write_uid", "write_date"]
    table = json_config['selected_table']
    conn = get_connection_to_db(
        json_config, json_config['config']['database_p'])
    cur = conn.cursor()

    s = ""
    s += "SELECT"
    s += " column_name"
    s += " FROM"
    s += " information_schema.columns"
    s += " WHERE TABLE_NAME ="
    s += " '" + table + "'"

    cur.execute(s)
    temp = cur.fetchall()
    order_by = temp[0][0]
    res = [(temp[0][0],)]
    temp.pop(0)
    for names in temp:
        if not exclude.__contains__(names[0]):
            res[0] = res[0] + (names[0],)
    s = ""
    s += "SELECT * INTO TEMP_ROWS"
    s += " FROM " + table + ";"
    cur.execute(s)
    for ex in exclude:
        s = " ALTER TABLE TEMP_ROWS DROP COLUMN IF EXISTS " + ex + ";"
        cur.execute(s)
    s = " SELECT * FROM TEMP_ROWS ORDER BY " + order_by + ";"
    cur.execute(s)
    res += cur.fetchall()
    s = " DROP TABLE TEMP_ROWS " + ";"
    cur.execute(s)

    conn.close()
    return res


def save_template(owner, json_config):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "INSERT INTO template(owner, config_json, name)"
    s += " VALUES ('" + owner + "', '" + json.dumps(
        json_config)+"', '"+json_config['template_name'] + "');"
    cur.execute(s)
    conn.commit()
    conn.close()


def remove_row(json_data, data, table):
    config = json_data['config']
    conn = get_connection_to_db(json_data, config['database_t'])
    cur = conn.cursor()
    s = ""
    s += "DELETE"
    s += " FROM "
    s += table
    s += " WHERE "
    for key in data:
        value = data[key]
        column_type = get_type(cur, table, key)
        if value == 'None':
            s += key + " IS NULL "
        elif column_type in ['integer', 'floating-point number'] or 'timestamp' in column_type:
            s += key + "=" + value
        else:
            s += key + "='" + value + "'"
        s += " AND "
    s = s[:-4]
    cur.execute(s)
    conn.commit()
    conn.close()


def check_remove(json_data, data, table):
    config = json_data['config']
    conn = get_connection_to_db(json_data, config['database_p'])
    cur = conn.cursor()
    s = ""
    s += "DELETE"
    s += " FROM "
    s += table
    s += " WHERE "
    for key in data:
        value = data[key]
        column_type = get_type(cur, table, key)
        if value == 'None':
            s += key + " IS NULL "
        elif column_type in ['integer', 'floating-point number'] or 'timestamp' in column_type:
            s += key + "=" + value
        else:
            s += key + "='" + value + "'"
        s += " AND "
    s = s[:-4]
    cur.execute(s)
    conn.close()


def check_update(json_data, data, table):
    config = json_data['config']
    conn = get_connection_to_db(json_data, config['database_p'])
    cur = conn.cursor()
    s = ""
    s += "UPDATE"
    s += " " + table
    s += " SET "
    for key in data:
        if key.endswith("_changed"):
            if data[key] == "true":
                key = key.replace('_changed', '')
                value = data[key]
                column_type = get_type(cur, table, key)[0]
                if value == 'None':
                    s += key + " IS NULL "
                elif column_type in ['integer', 'floating-point number'] or 'timestamp' in column_type:
                    s += key + "=" + value
                else:
                    s += key + "='" + value + "'"
                s += " AND "
    s = s[:-4]
    s += " WHERE "
    for key in data:
        if key.endswith("_changed"):
            if data[key] == "false":
                key = key.replace('_changed', '')
                value = data[key]
                column_type = get_type(cur, table, key)[0]
                if value == 'None':
                    s += key + " IS NULL "
                elif column_type in ['integer', 'floating-point number'] or 'timestamp' in column_type:
                    s += key + "=" + value
                else:
                    s += key + "='" + value + "'"
                s += " AND "
    s = s[:-4]
    cur.execute(s)
    conn.close()


def update_id(json_data, data, id_key, table):
    config = json_data['config']
    conn = get_connection_to_db(json_data, config['database_t'])
    cur = conn.cursor()
    s = ""
    s += "UPDATE"
    s += " " + table
    s += " SET "
    for key in data:
        if key.endswith("_changed"):
            if data[key] == "true":
                key = key.replace('_changed', '')
                value = data[key]
                if value == 'None':
                    s += key + " IS NULL "
                else:
                    column_type = get_type(cur, table, key)[0]
                    if column_type in ['integer', 'floating-point number'] or 'timestamp' in column_type:
                        s += key + "=" + value
                    else:
                        s += key + "='" + value + "'"
                s += ", "
    s = s[:-2]
    s += " WHERE id =" + str(id_key)
    cur.execute(s)
    conn.commit()
    conn.close()


def update_without_id(json_data, data, table):
    config = json_data['config']
    conn = get_connection_to_db(json_data, config['database_t'])
    cur = conn.cursor()
    s = ""
    s += "UPDATE"
    s += " " + table
    s += " SET "
    for key in data:
        if key.endswith("_changed"):
            if data[key] == "true":
                key = key.replace('_changed', '')
                value = data[key]
                column_type = get_type(cur, table, key)[0]
                if value == 'None':
                    s += key + " IS NULL "
                elif column_type in ['integer', 'floating-point number'] or 'timestamp' in column_type:
                    s += key + "=" + value
                else:
                    s += key + "='" + value + "'"
                s += " AND "
    s = s[:-4]
    s += " WHERE "
    for key in data:
        if key.endswith("_changed"):
            if data[key] == "false":
                key = key.replace('_changed', '')
                value = data[key]
                column_type = get_type(cur, table, key)[0]
                if value == 'None':
                    s += key + " IS NULL "
                elif column_type in ['integer', 'floating-point number'] or 'timestamp' in column_type:
                    s += key + "=" + value
                else:
                    s += key + "='" + value + "'"
                s += " AND "
    s = s[:-4]
    cur.execute(s)
    conn.commit()
    conn.close()


def save_transfer(json_config):
    json_config_temp = {}
    json_config_c = {}
    json_config_c['host'] = 'localhost'
    json_config_c['port'] = '5432'
    json_config_c['db_user'] = 'postgres'
    json_config_c['password'] = 'testtest'
    json_config_temp['config'] = json_config_c
    conn = get_connection_to_db(json_config_temp, 'user_config')
    cur = conn.cursor()
    s = ""
    s += "INSERT INTO transfers(username, date, config_json)"
    s += " VALUES ('" + json_config['user']+"', '"+datetime.datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S") + "', '" + json.dumps(json_config) + "');"
    cur.execute(s)
    conn.commit()
    conn.close()


def is_date(string, fuzzy=False):
    from dateutil.parser import parse
    try:
        parse(string, fuzzy=fuzzy)
        return True

    except ValueError:
        return False


def data_dump_aanmaken(json_data):
    config = json_data['config']
    free = (shutil.disk_usage('/').free // (2 ** 20))
    database_size = get_databases_size(json_data, config['database_p'])[
        0][0].split(" ")[0]
    if int(free) < int(database_size):
        return False
    FNULL = open(os.devnull, 'w')
    process = subprocess.Popen(
        ['pg_dump',
         '--dbname=postgresql://{}:{}@{}:{}/{}'.format(config['db_user'], config['password'], config['host'],
                                                       config['port'], config['database_p']),
         '-Fc',
         '-f', 'db_backup/backup_file.sql',
         '-v'],
        stdout=FNULL, stderr=subprocess.STDOUT
    )
    process.wait()
    return True

def send_mail(json_data):
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    import smtplib
    # set up the SMTP server
    s = smtplib.SMTP(host='smtp-mail.outlook.com', port=587)
    s.starttls()
    s.login('svrijnberk@erpopen.nl', 'K_fRk%kQHxprySh')
    msg = MIMEMultipart()       # create a message

    # add in the actual person name to the message template
    message = ("Transfer from production with database "+json_data['config']['database_p'] + " has finisished")
    emails = json_data['emails'].split(";")
    for email in emails:
        if email=="":
            continue
        if '@' not in email:
            continue
    # setup the parameters of the message
        msg['From']='svrijnberk@erpopen.nl'
        msg['To']=email
        msg['Subject']='Transfer finished'
        msg.attach(MIMEText(message, 'plain'))
        s.send_message(msg)
        

def start_odoo(json_data):
    #function to start the odoo server
    config = json_data['config']
    FNULL = open(os.devnull, 'w')
    process = subprocess.Popen(
        ['start odoo command'],
        stdout=FNULL, stderr=subprocess.STDOUT
    )
    process.wait()
    return True

def stop_odoo(json_data):
    #function to start the odoo server
    config = json_data['config']
    FNULL = open(os.devnull, 'w')
    process = subprocess.Popen(
        ['stop odoo command '],
        stdout=FNULL, stderr=subprocess.STDOUT
    )
    process.wait()
    return

def install_modules(json_data):
    #function to start the odoo server
    config = json_data['config']
    FNULL = open(os.devnull, 'w')
    process = subprocess.Popen(
        ['install module and activate command'],
        stdout=FNULL, stderr=subprocess.STDOUT
    )
    process.wait()
    return

def restore_data_dump(json_data):
    config = json_data['config']
    databases = get_databases(json_data)
    conn = get_connection(json_data)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    for database in databases:
        if database[0] == config['database_t']:
            cursor.execute("""DROP DATABASE "{}" ;""".format(
                config['database_t']))
            break

    cursor.execute("""CREATE DATABASE "{}" ;""".format(config['database_t']))
    conn.commit()
    conn.close()
    FNULL = open(os.devnull, 'w')
    process = subprocess.Popen(
        ['pg_restore',
         '--no-owner',
         '--dbname=postgresql://{}:{}@{}:{}/{}'.format(config['db_user'], config['password'], config['host'],
                                                       config['port'], config['database_t']),
         '-v',
         "db_backup/backup_file.sql"],
        stdout=FNULL, stderr=subprocess.STDOUT
    )
    process.wait()
    delete_file("db_backup/backup_file.sql")


def set_ir_cron(conn):
    cur = conn.cursor()
    cur.execute("update ir_cron set active = false where active = true")
    conn.commit()


def change_uuid(conn):
    cur = conn.cursor()
    import uuid
    new_uuid = str(uuid.uuid1())
    cur.execute("update ir_config_parameter set value='" +
                new_uuid + "' where key='database.uuid'")
    conn.commit()


def remove_enterprise_code(conn):
    cur = conn.cursor()
    cur.execute(
        "delete from ir_config_parameter where key='database.enterprise_code'")
    conn.commit()


def encypt_pass(password):
    from passlib.context import CryptContext
    if len(password) > 0:
        setpw_with_scheme = CryptContext(['pbkdf2_sha512'])
        hashed = setpw_with_scheme.hash(password, scheme='pbkdf2_sha512')
    return hashed


def change_admin_pass(json_data, conn):
    config = json_data['config']
    cur = conn.cursor()
    cur.execute("update res_users set password='" +
                config['admin_pass'] + "' where login='admin'")
    conn.commit()


def mailtrap(json_data, conn):
    config = json_data['config']
    cur = conn.cursor()
    cur.execute(
        "update ir_mail_server set smtp_port='" + str(config['smtp_port'])
        + "', smtp_user='" + str(config['email_mailtrap'])
        + "', smtp_pass='" + str(config['pass_mailtrap'])
        + "' where name='uitgaande server'")
    conn.commit()


def remove(json_data):
    remove_list = json_data['remove']
    for item in remove_list:
        remove_row(json_data, item['data'], item['table'])


def update(json_data):
    update_list = json_data['update']
    for item in update_list:
        id_key = item['id']
        table = item['table']
        item.pop('id')
        item.pop('table')
        if id_key == "undefined":
            for key in item:
                if key.endswith("_changed"):
                    if item[key] == "true":
                        update_without_id(json_data, item, table)
        else:
            update_id(json_data, item, id_key, table)


def set_settings(json_data):
    config = json_data['config']
    conn = get_connection_to_db(json_data, config["database_t"])
    set_ir_cron(conn)
    change_uuid(conn)
    remove_enterprise_code(conn)
    change_admin_pass(json_data, conn)
    mailtrap(json_data, conn)
    conn.close()
    return "succes"


def copy_file(from_file, to_path, ignore_files):
    if ignore_files.__contains__(from_file):
        return
    if os.path.isdir(to_path):
        files = os.listdir(to_path)
        for f in files:
            if f == from_file.split("/")[-1:][0]:
                delete_file(to_path + "/" + f)
    else:
        os.mkdir(to_path)
    import shutil
    shutil.copy(from_file, to_path + "/" + str(from_file.split("/")[-1:][0]))
    # print("copied file: " + from_file + " to path " + to_path)


def copy_files_to_dir(path_to_from, path_to_copy, ignore_files):
    files = os.listdir(path_to_from)
    for f in files:
        if ignore_files.__contains__(f):
            continue
        if os.path.isfile(path_to_from + "/" + f):
            copy_file(path_to_from + "/" + f, path_to_copy, ignore_files)
        else:
            if os.path.isdir(path_to_copy + "/" + f):
                if ignore_files.__contains__(f):
                    continue
                copy_files_to_dir(path_to_from + "/" + f,
                                  path_to_copy + "/" + f, ignore_files)
            else:
                os.mkdir(path_to_copy + "/" + f)
                copy_files_to_dir(path_to_from + "/" + f,
                                  path_to_copy + "/" + f, ignore_files)
    print("copied files from: " + path_to_from + " to " + path_to_copy)


def delete_file(path_to_file):
    os.remove(path_to_file)
    # print("deleted file: " + path_to_file)


def update_version(version_file_path):
    with open(version_file_path, 'r+') as f:
        f_content = f.read()
        version = int(f_content[f_content.find("version") + 8])
        subversion = int(f_content[f_content.find("version") + 10])
        tempversion = "version " + str(version) + "." + str(subversion)
        if subversion < 9:
            subversion = subversion + 1
        else:
            subversion = 0
            version = version + 1
        f.seek(f_content.find("version"))
        f.write("version " + str(version) + "." + str(subversion))
        print("update version from " + tempversion + " to " +
              "version " + str(version) + "." + str(subversion))


def get_repo(path):
    repo = git.Repo(path)
    assert not repo.bare
    return repo


def get_connection_to_db(json_config, database_to_connect):
    config = json_config['config']
    conn = psycopg2.connect(
        host=config['host'],
        database=database_to_connect,
        user=config['db_user'],
        password=config['password'])
    return conn


def get_connection(json_config):
    config = json_config["config"]
    conn = psycopg2.connect(
        host=config['host'],
        user=config['db_user'],
        password=config['password'])
    return conn


def update_git(path, branch):
    repo = get_repo(path)
    for remote in repo.remotes:
        remote.fetch()
    g = repo.git
    print(repo.active_branch)
    if branch != repo.active_branch:
        g.checkout(branch)
    from datetime import date
    from datetime import datetime
    now = datetime.now()
    t = repo.head.commit.tree

    current_time = now.strftime("%H:%M:%S")
    if repo.git.diff(t):
        repo.git.add('--all')
        repo.git.commit('-m', 'auto commit ' + str(date.today()) + " " + str(current_time),
                        author='silvanrijnberk@live.com')
    else:
        print("nothing committed, no changes on branch: " +
              branch + " on repo: " + path)
    g.pull('origin', branch)
    g.push('origin', branch)
    print(path + " updated on branch " + branch)


def push_git(path, branch):
    repo = get_repo(path)
    for remote in repo.remotes:
        remote.fetch()
    g = git.Git('C:/Users/Silva/OneDrive/erpopen/OdooTestGIt')
    if branch != repo.active_branch:
        g.checkout(branch)
    from datetime import date
    from datetime import datetime
    now = datetime.now()
    t = repo.head.commit.tree

    current_time = now.strftime("%H:%M:%S")
    if repo.git.diff(t):
        repo.git.add('--all')
        repo.git.commit('-m', 'auto commit ' + str(date.today()) + " " + str(current_time),
                        author='silvanrijnberk@live.com')
    else:
        print("nothing committed, no changes on branch: " +
              branch + " on repo: " + path)
    g.push('origin', branch)
    print(path + " updated on branch " + branch)


@require()
@cherrypy.expose
class Tables(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        json_data = cherrypy.request.json
        rows = get_rows(json_data)
        res = {}
        rows_list = []
        for row in rows:
            row_list = []
            for data in row:
                if isinstance(data, datetime.datetime):
                    f = '%Y-%m-%d %H:%M:%S'
                    data = data.strftime(f)
                row_list.append(str(data))
            rows_list.append(row_list)
        res['rows'] = rows_list
        json_dump = json.dumps(res)
        return json_dump


@require()
@cherrypy.expose
class User(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        res = cherrypy.request.json
        req = cherrypy.request
        sess = cherrypy.session
        if not 'user' in res.keys() or sess['user'].get('preferred_username') != res['user']:
            res['user'] = req.login
            res['name'] = sess['user']['name']
            res = get_user_data(res)
        return res

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def PUT(self):
        res = cherrypy.request.json
        save_user_data(res)
        return res


@require()
@cherrypy.expose
class Users(object):

    @cherrypy.tools.json_out()
    def GET(self):
        res = get_users_data()
        return res

    @require(member_of('admin'))
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        res = cherrypy.request.json
        set_role(res['username'], res['role'])
        result = {"operation": "request", "result": "success"}
        return result


@require()
@cherrypy.expose
class Companies(object):

    @cherrypy.tools.json_out()
    def GET(self):
        res = get_companies()
        return res

    @require(member_of('admin'))
    @cherrypy.tools.json_out()
    def DELETE(self, cid):
        cid = cid
        delete_company(cid)
        result = {"operation": "request", "result": "success"}
        return result

    @require(member_of('admin'))
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        res = cherrypy.request.json
        if int(res['id']) < 0:
            del res['id']
            save_companie(res)
        else:
            set_companie(res)

        result = {"operation": "request", "result": "success"}
        return result


@require()
@cherrypy.expose
class CheckRemove(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        json_data = cherrypy.request.json
        check_remove(json_data, json_data['remove'][0]
                     ['data'], json_data['remove'][0]['table'])
        result = {"operation": "request", "result": "success"}
        return result


@require()
@cherrypy.expose
class CheckUpdate(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        json_data = cherrypy.request.json
        item = json_data['update'][0]
        table = item['table']
        item.pop('id')
        item.pop('table')
        for key in item:
            if key.endswith("_changed"):
                if item[key] == "true":
                    try:
                        check_update(json_data, item, table)
                    except Exception as e:
                        print(e)
                        result = {"operation": "request",
                                  "result": "failed", "error": str(e)}
                        return result
                    else:
                        result = {"operation": "request", "result": "success"}
                        return result
        result = {"operation": "request", "result": "success"}
        return result


@require()
@cherrypy.expose
class Transfers(object):

    @cherrypy.tools.json_out()
    def GET(self):
        res = get_transfers(cherrypy.request.login)
        return res


@require()
@cherrypy.expose
class Environment(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        json_data = cherrypy.request.json
        res = {}
        databases = get_databases(json_data)
        res['databases'] = databases
        users = get_users(json_data)
        res['users'] = users
        json_dump = json.dumps(res)
        return json_dump


@require()
@cherrypy.expose
class Savetemplate(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        json_data = cherrypy.request.json
        owner = json_data['user']
        del json_data['user']
        save_template(owner, json_data)
        result = {"operation": "request", "result": "success"}
        return result


@require()
@cherrypy.expose
class Gettemplate(object):

    @cherrypy.tools.json_out()
    def GET(self, tid):
        res = get_template(tid)
        return res


@require()
@cherrypy.expose
class Gettemplates(object):

    @cherrypy.tools.json_out()
    def GET(self, role):
        res = get_templates(cherrypy.request.login, role)
        return res


@require()
@cherrypy.expose
class Deletetemplate(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        json_data = cherrypy.request.json
        result = {"operation": "request", "result": "success"}
        if json_data['owner'] == cherrypy.request.json or json_data['role'] == 'admin':
            delete_template(json_data['id'])
        else:
            result['result'] = 'failed'
        cherrypy.session.cache.update()
        cherrypy.serving.session.cache.update()
        cherrypy.session.cache.clear()
        cherrypy.serving.session.cache.clear()
        
        return result


@require()
@cherrypy.expose
class Database(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        json_data = cherrypy.request.json
        res = {'tables': get_tables(json_data)}

        json_dump = json.dumps(res)
        return json_dump

    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def PUT(self):
        json_data = cherrypy.request.json
        result = {"operation": "request", "result": "success"}
        if json_data['action'] == "data_dump_aanmaken":
            data_dump_aanmaken(json_data)
            return result
        if json_data['action'] == "restore_data_dump":
            restore_data_dump(json_data)
            return result
        if json_data['action'] == "set_settings":
            set_settings(json_data)
            return result
        if json_data['action'] == "update_ids":
            if 'update' in json_data.keys():
                update(json_data)
            return result
        if json_data['action'] == "remove_ids":
            if 'remove' in json_data.keys():
                remove(json_data)
            save_transfer(json_data)
            return result
        if json_data['action'] == "stop_odoo":
            stop_odoo(json_data)
            return result    
        if json_data['action'] == "install_modules":
            install_modules(json_data)
            return result
        if json_data['action'] == "start_odoo":
            start_odoo(json_data)
            return result

        if json_data['action'] == "email":
            from threading import Thread
            def thread_request(json_data):
                data_dump_aanmaken(json_data)
                restore_data_dump(json_data)
                set_settings(json_data)
                if 'update' in json_data.keys():
                    update(json_data)
                if 'remove' in json_data.keys():
                    remove(json_data)
                save_transfer(json_data)
                send_mail(json_data)
            thread = Thread(target=thread_request, kwargs={'json_data': json_data})
            thread.start()
            return result
        result["result"] = "failed"
        return result


if __name__ == '__main__':
    html = {
        'tools.sessions.on': True,
        'tools.auth.on': True,
        'tools.staticdir.root': getPath(''),
        'tools.response_headers.headers': [('Content-Type', 'application/json')],
        'tools.sessions.timeout': 60,
    }

    REST = {
        'tools.sessions.on': True,
        'tools.auth.on': True,
        'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
        'tools.response_headers.on': True,
        'tools.response_headers.headers': [('Content-Type', 'application/json')],
        'tools.sessions.timeout': 60,
    }

    REST_caching = {
        'tools.sessions.on': True,
        'tools.auth.on': True,
        'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
        'tools.response_headers.on': True,
        'tools.response_headers.headers': [('Content-Type', 'application/json')],
        'tools.sessions.timeout': 60,
    }
    conf = {
        '/': html,
        '/auth': {
            'tools.sessions.on': True,
            'tools.sessions.timeout': 60,
            'tools.auth.on': True,
            'tools.staticdir.root': getPath(''),
            'tools.response_headers.headers': [('Content-Type', 'application/json')],

        },
        '/user': REST,
        '/Users': REST,
        '/Companies': REST,
        '/tables': REST,
        '/environment': REST,
        '/database': REST,
        '/checkRemove': REST,
        '/checkUpdate': REST,
        '/savetemplate': REST,
        '/gettemplates': REST,
        '/gettemplate': REST,
        '/deletetemplate': REST,
        '/transfers': REST,
        '/static': {
            'tools.sessions.on': True,
            'tools.sessions.timeout': 60,
            'tools.staticdir.on': True,
            'tools.staticdir.dir': './static',
            
        }
    }
webapp = pages()
webapp.auth = AuthController()
webapp.user = User()
webapp.Users = Users()
webapp.Companies = Companies()
webapp.tables = Tables()
webapp.environment = Environment()
webapp.database = Database()
webapp.checkRemove = CheckRemove()
webapp.checkUpdate = CheckUpdate()
webapp.savetemplate = Savetemplate()
webapp.gettemplates = Gettemplates()
webapp.gettemplate = Gettemplate()
webapp.deletetemplate = Deletetemplate()
webapp.transfers = Transfers()
cherrypy.quickstart(webapp, '/', conf)
