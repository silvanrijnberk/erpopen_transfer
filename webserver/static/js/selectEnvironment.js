function get_environment() {
    $.ajax({
        type: "post",
        url: "/environment",
        data: sessionStorage.getItem('config'),
        contentType: 'application/json',
        dataType: 'json',
        error: function () {
            let json_config = JSON.parse(sessionStorage.getItem('config'));
            if(json_config['template']){
                window.location.href = '/selectHostTemplate';
            }
            else{
                window.location.href = '/selectHostTransfer';
            }
            alert('first fill in database password')
        },
        success: function (JSON_string) {
            let JSONobject = JSON.parse(JSON_string);
            let databases = JSONobject['databases'];
            $("#database_p option").remove();
            for (index in databases) {
                if(databases[index].includes("postgres")){
                    continue;
                }
                $('#database_p').append($("<option></option>").attr("value", databases[index]).text(databases[index]));
            }
            let users = JSONobject['users'];
            $("#users_d option").remove();
            for (index in users) {
                $('#users_d').append($("<option></option>").attr("value", users[index]).text(users[index]));
            }
            setLogin()
        }
    });
}
function setLogin() {
        let json_data = JSON.parse(sessionStorage.getItem('config'));
        if (json_data['config'] !== undefined) {
            let json_config = json_data['config'];
            if (json_config['database_t'] !== undefined) {
                $("#database_t").val(json_config['database_t']);
            }
            if (json_config['admin_pass'] !== undefined) {
                $("#admin_pass").val(json_config['admin_pass']);
            }
            if (json_config['user_p'] !== undefined) {
                $("#users_d").val(json_config['user_p']);
            }
            if (json_config['email_mailtrap'] !== undefined) {
                $("#email_mailtrap").val(json_config['password']);
            }
            if (json_config['pass_mailtrap'] !== undefined) {
                $("#pass_mailtrap").val(json_config['pass_mailtrap']);
            }
            if (json_config['database_p'] !== undefined) {
                $("#database_p").val(json_config['database_p']);
            }
            if (json_config['smtp_port'] !== undefined) {
                $("#smtp_port").val(json_config['smtp_port']);
            }
        }
}
function load_page(href) {
    window.location.href = href;
}

function back_to_selectHost(){
    let json_obj_config = JSON.parse(sessionStorage.getItem('config'))
    if(json_obj_config['template']){
        window.location.href = '/selectHostTemplate';

    }
    else{
        window.location.href = '/selectHostTransfer';

    }
}

function init() {
    let json_obj_config = JSON.parse(sessionStorage.getItem("config"));
    if (json_obj_config["template"] !== undefined) {
        $("#transfer").removeClass("selected");
        $("#template").addClass("selected");
        $("h1").text("Environment template");
        if(json_obj_config["user_settings"]["theme"]==='color')
        $(".header").css("background-color", "rgb(96, 42, 121)");
    }
    get_environment();
    $("#config_database").click(function (e) {
        if(!$("#database_t").val() ||
        !$("#admin_pass").val() ||
        !$("#email_mailtrap").val() ||
        !$("#smtp_port").val() ||
        !$("#pass_mailtrap").val()){
            alert("first fill in all values");
            return;
    }
        let database_t = $("#database_t").val();
        let admin_pass = $("#admin_pass").val();
        let user_p = $("#users_d option:selected").val();
        let email_mailtrap = $("#email_mailtrap").val();
        let pass_mailtrap = $("#pass_mailtrap").val();
        let database_p = $("#database_p option:selected").val();
        let smtp_port = $("#smtp_port").val();

        let json_obj = JSON.parse(sessionStorage.getItem("config"));
        json_obj_config = json_obj['config'];
        json_obj_config['database_t'] = database_t;
        json_obj_config['admin_pass'] = admin_pass;
        json_obj_config['user_p'] = user_p;
        json_obj_config['smtp_port'] = smtp_port;
        json_obj_config['email_mailtrap'] = email_mailtrap;
        json_obj_config['pass_mailtrap'] = pass_mailtrap;
        json_obj_config['database_p'] = database_p;
        json_obj['config'] = json_obj_config;
        if (json_obj['remove'] === undefined)
            json_obj['remove'] = [];
        if (json_obj['update'] === undefined)
            json_obj['update'] = [];
        sessionStorage.setItem("config", JSON.stringify(json_obj));
        load_page('/editDatabase');
        e.preventDefault();

    });
}
