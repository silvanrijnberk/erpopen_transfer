function logOut() {
    sessionStorage.removeItem('config')
    sessionStorage.removeItem('companies')
    sessionStorage.removeItem('templates')
    sessionStorage.removeItem('users')
    sessionStorage.removeItem('transfers')
    $.get("/auth/logout", function () { });
    window.location.href = "/signin";
}
function settings_init() {
    let json_obj_config = {};
    if (sessionStorage.getItem("config") !== undefined && sessionStorage.getItem("config") !== null) {
        json_obj_config = JSON.parse(sessionStorage.getItem("config"));
    }
    else {
        json_obj_config = {};
    }
    if (window.location.href.includes("/selectHostTemplate")) {
        let json_obj_config = JSON.parse(sessionStorage.getItem('config'));
        json_obj_config['template'] = true;
        delete json_obj_config['config'];
        delete json_obj_config['template_name']
        delete json_obj_config['update'];
        delete json_obj_config['remove'];
        sessionStorage.setItem("config", JSON.stringify(json_obj_config));
    }

    if (window.location.href.includes("/selectHostTransfer")) {
        let json_obj_config = JSON.parse(sessionStorage.getItem('config'));
        delete json_obj_config['template'];
        delete json_obj_config['config'];
        delete json_obj_config['template_name']
        delete json_obj_config['update'];
        delete json_obj_config['remove'];
        sessionStorage.setItem("config", JSON.stringify(json_obj_config));
    }
    let json_config = JSON.parse(sessionStorage.getItem('config'));
    if (json_config['role'] == 'admin') {
        if (window.location.href.includes("/companies")) {
            $('.sidenav').append('<a href="/companies" class="selected" >Companies</a>');
            $('.sidenav').append('<a href="/users">Users</a>');
        } else {
            if (window.location.href.includes("/users")) {
                $('.sidenav').append('<a href="/companies">Companies</a>');
                $('.sidenav').append('<a href="/users" class="selected">Users</a>');
            }
            else {
                $('.sidenav').append('<a href="/companies">Companies</a>');
                $('.sidenav').append('<a href="/users">Users</a>');
            }
        }
        if (document.referrer.includes("/auth")) {
            $(".sidenav").load(location.href + ".sidenav");
        }
    }
    else {
        if (document.referrer.includes("/auth")) {
            $(".sidenav").load(location.href + ".sidenav");
        }
    }
}
function whatIsIt(object) {
    if (object === null)
        return "N";
    if (object === undefined)
        return "U";
    if (object.constructor === String)
        return "S";
    if (object.constructor === Array)
        return "A";
    if (object.constructor === Object)
        return "O";
    return "don't know";

}

function theme() {
    let user_settings_theme = JSON.parse(sessionStorage.getItem('config'))['user_settings']['theme'];

    $(".listTable td").each(function () {
        $(this).prop('title', $(this).text());
    });
    if (user_settings_theme === 'dark') {
        console.log('dark')
        $(".modal-content").css("background-color", "hsl(0, 0%, 20%)");
        $(".modal-content").css("color", "white");
        $("label").css("color", "white");
        $("table:not('.listTable')").css("color", "white");
        $(".center").css("background-color", "hsl(0, 0%, 20%)");
        $("body").css("background-color", "#777");
        $("select").css("background-color", "#888");
        $("input").css("background-color", "lightgrey");
        $("button").css("background-color", "#444");
        $("button").css("color", "white");
        $("button").css("background", "#444");
        $("button").css("font-weight", "100");

        $('button').hover(function () {
            $(this).css("background-color", "hsl(0, 0%, 60%)");
            $(this).css("color", "black");
        }, function () {
            $(this).css("background-color", "#444");
            $(this).css("color", "white");
        });

        $(".listTable tr").css("background-color", "#999");
        $(".listTable tr").css("border", "1px solid black");
        $(".listTable .clickable td").css("border-top", "1px solid rgb(84, 164, 255)");
        $(".listTable .clickable td").css("border-bottom", "1px solid rgb(84, 164, 255)");

        $('.listTable .clickable').hover(function () {
            $(this).css("background-color", "hsl(0, 0%, 20%)");
        }, function () {
            $(this).css("background-color", "#999");
        });

        $(".header").css("background-color", "#444");
        $("th").css("background-color", "#444");
        $("th").css("color", "white");

    }
    if (user_settings_theme === 'bright') {
        $("body").css("background-color", "whitesmoke");
        $("button").css("background-color", "white");
        $("button").css("background", "white");
        $("button").css("font-weight", "100");
        $('button').hover(function () {
            $(this).css("background-color", "darkgrey");
        }, function () {
            $(this).css("background-color", "white");
        });
        $("th").css("background-color", "#666");
        $(".listTable tr").css("background-color", "white");
        $("button").css("color", "black");
        $("button").css("border", "1px solid black");
        $('.listTable .clickable').hover(function () {
            $(this).css("background-color", "darkgrey");
        }, function () {
            $(this).css("background-color", "white");
        });
        $(".listTable tr:not('.clickable') td").css("border-top", "1px solid black");
        $(".listTable th").css("background-color", "lightgrey");
        $(".listTable .row_id").css("background-color", "lightgrey");
        $(".listTable .row_id").css("color", "black");

        $(".listTable th").css("color", "black");
        $(".listTable .clickable td").css("border-top", "1px solid rgb(84, 164, 255)");
        $(".listTable .clickable td").css("border-bottom", "1px solid rgb(84, 164, 255)");
        $(".header").css("background-color", "lightgrey");
        $(".header").css("color", "black");
    }
        button_transition();
}

async function button_transition(){
    var timeout = null;
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            $("button").css('transition', '0.4s')
        }, 400);
}

$(document).keypress(function (event) {

    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        $("button[name*='next']").trigger('click');
        console.log("pressed")
    }

});
$(document).ready(function () {
    let json_obj_config = {};
    if (sessionStorage.getItem("config") !== undefined && sessionStorage.getItem("config") !== null && !jQuery.isEmptyObject(JSON.parse(sessionStorage.getItem("config"))).length > 0) {
        theme();
    }
    if (sessionStorage.getItem("config") !== undefined && sessionStorage.getItem("config") !== null && !jQuery.isEmptyObject(JSON.parse(sessionStorage.getItem("config"))).length > 0) {
        json_obj_config = JSON.parse(sessionStorage.getItem("config"));

    }
    $.ajax({
        type: "POST",
        url: "/user",
        data: JSON.stringify(json_obj_config),
        contentType: 'application/json',
        dataType: 'json',
        error: function () {
            alert("not logged in");
            window.location.href = "/signin";
        },
        success: function (json_data) {
            window.start;
            $("#main").prepend(`<div style="color: #f1f1f1;
            background-color: hsl(0, 0%, 15%);
            border-radius: 10px;
            padding: 5px; float: right; font-size: 16px; margin-left: -100%;margin-top: 5px; margin-right: 5px" >   <label id='username' style="padding: 0px 0px; margin: 0px 0px; font-size:16px"></label>
            <button id="settings" class="settings" style=" font-size:14px;margin: 0px 0px; padding:2px 2px; background-color: grey; border: 0px;    border-radius: 6px;  font: 400 13.3333px Arial;" onClick="javascript:showSettings()"><img src="static/css/images/22338.png" style="width:20px; height:20px;" /></button>
            </div>`)
            json_obj_config = json_data;
            let Name = json_obj_config['name'];
            $('#username').text("User: " + Name);
            if (!window.location.href.includes('/overview') && !window.location.href.includes('/select') && !window.location.href.includes('/edit')) {
                delete json_obj_config['config'];
                delete json_obj_config['update'];
                delete json_obj_config['remove'];
                delete json_obj_config['template_name'];
            }
            sessionStorage.setItem("config", JSON.stringify(json_obj_config));
            init();
            settings_init();
            if (document.referrer.includes("/auth")) {
                sessionStorage.clear();
                location.reload(true);
            }
        },
    });
    

    $('body').append(`
    <div class="modal fade" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="saveEditModalLabel"
    aria-hidden="true">
    <div class="modal-dialog" role="document">
    <div class="modal-content">
        <div class="modal-header">
        <h5 class="modal-title" id="saveEditModalLabel">Settings</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </div>
        <div class="modal-body">
        <table id="settings_table">

        </table>
        </div>
        <div class="modal-footer">
        <button type="button" class="done btn btn-primary" id="doneSettings">Done</button>
        </div>
    </div>
    </div>
    </div>
    `);
    $('#doneSettings').on('click', function () {
        $('#settingsModal').modal('toggle');
        let json_config = JSON.parse(sessionStorage.getItem('config'));

        let always_templates = $('#always_temp_slider').is(":checked");
        let standard_template = $('#template_standard').val();
        let skip_config_settings = $('#skip_config').is(":checked");
        let theme = $('#themes').val();
        let user_settings = {};
        let theme_temp = json_config['user_settings']['theme'];

        user_settings["always_template"] = always_templates;
        user_settings["standard_template"] = standard_template;
        user_settings["skip_config_settings"] = skip_config_settings;
        user_settings["theme"] = theme;
        json_config["user_settings"] = user_settings;
        console.log(user_settings)
        sessionStorage.setItem("config", JSON.stringify(json_config));
        if (theme_temp != theme) {
            location.reload();
        }
        $.ajax({
            type: "PUT",
            url: "/user",
            data: JSON.stringify(json_config),
            contentType: 'application/json',
            dataType: 'json',
            error: function () {
                alert("not logged in");
            },
            success: function (json_data) {
                json_obj_config = json_data;
                sessionStorage.setItem("config", JSON.stringify(json_obj_config));
                if (window.location.href.includes("/selectHostTransfer")) {
                    location.reload();
                }

            },
        });
    });
});


function template() {
    $.ajax({
        type: "POST",
        url: "/user",
        data: JSON.stringify({}),
        contentType: 'application/json',
        dataType: 'json',
        error: function () {
            alert("not logged in");
        },
        success: function (json_data) {
            sessionStorage.setItem("config", JSON.stringify(json_data));
            let json_obj_config = JSON.parse(sessionStorage.getItem('config'));
            json_obj_config['template'] = true;
            sessionStorage.setItem("config", JSON.stringify(json_obj_config));
            window.location.href = '/selectHostTemplate'
        },
    });
}
function transfer() {
    $.ajax({
        type: "POST",
        url: "/user",
        data: JSON.stringify({}),
        contentType: 'application/json',
        dataType: 'json',
        error: function () {
            alert("not logged in");
        },
        success: function (json_data) {
            sessionStorage.setItem("config", JSON.stringify(json_data));
            let json_obj_config = JSON.parse(sessionStorage.getItem('config'));
            delete json_obj_config['template'];
            sessionStorage.setItem("config", JSON.stringify(json_obj_config));
            window.location.href = '/selectHostTransfer'
        },
    });
}


function showSettings() {
    let json_config = JSON.parse(sessionStorage.getItem('config'));
    let user_settings = json_config["user_settings"];
    $('#settings_table tr').remove();

    let row_html = '<tr>'
    row_html += "<td >";
    row_html += "Always use template";
    row_html += "</td>";
    row_html += "<td>";
    row_html += '<label class="switch"><input id= "always_temp_slider" type="checkbox" checked><span class="slider round"></span></label>';
    row_html += "</td>";
    row_html += "</tr>";
    row_html += '<tr>'
    row_html += "<td >";
    row_html += "Standard template";
    row_html += "</td>";
    row_html += "<td>";
    row_html += '<select name="templates" id="template_standard"></select>';
    row_html += "</td>";
    row_html += "</tr>";
    row_html += '<tr>'
    row_html += "<td >";
    row_html += "Skip configurations settings";
    row_html += "</td>";
    row_html += "<td>";
    row_html += '<label class="switch"><input id="skip_config" type="checkbox" checked><span class="slider round"></span></label>';
    row_html += "</td>";
    row_html += "</tr>";
    row_html += '<tr>'
    row_html += "<td >";
    row_html += "Theme";
    row_html += "</td>";
    row_html += "<td>";
    row_html += `<select name="themes" id="themes">  
    <option value="color">Color</option>
    <option value="dark">Dark</option>
    <option value="bright">Light</option>
    </select>`;
    row_html += "</td>";
    row_html += "</tr>";
    $('#settings_table').append(row_html);
    $.ajax({
        url: "/gettemplates/" + JSON.parse(sessionStorage.getItem('config'))['role'], success: function (json) {
            let templates = json['templates'];
            if (templates.length > 0) {
                $("#template_standard option").remove();
                $('#template_standard').append($("<option></option>").attr("value", 'empty').text('no template'));
                for (index in templates) {
                    $('#template_standard').append($("<option></option>").attr("value", templates[index]['id']).text(templates[index]['name']));
                }
            }
            user_settings["standard_template"];
            $('#template_standard').val(user_settings["standard_template"]).change();

            $('#themes').val(user_settings["theme"]).change();
            if ($("#themes").val() === "" || $("#themes").val() === null) {
                $('#themes').prop('selectedIndex', 0);
            }
            console.log($("#template_standard").val())
            if ($("#template_standard").val() === "" || $("#template_standard").val() === null) {
                $('#template_standard').prop('selectedIndex', 0);
            }

            $("#always_temp_slider").prop("checked", Boolean(user_settings["always_template"]));
            $("#skip_config").prop("checked", Boolean(user_settings["skip_config_settings"]));
            $("#settingsModal").modal("show");
            theme();
        }
    });
}

