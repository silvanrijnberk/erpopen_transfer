
function load_template() {
    if ($("#templates option:selected").val() === undefined || $("#templates option:selected").val() === null || $("#templates option:selected").val() === 'empty') {
        return;
    }
    $.ajax({
        url: "/gettemplates/" + JSON.parse(sessionStorage.getItem('config'))['role'], success: function (json) {

            let templates = json['templates'];
            let json_template;
            for (i in templates) {
                if (templates[i]['id'] == $("#templates option:selected").val()) {
                    json_template = templates[i];
                    break;
                }
            }
            let json_data = json_template['config_json'];
            let json_old_config = JSON.parse(sessionStorage.getItem("config"));
            if (json_old_config['template'] !== undefined) {
                json_data['template'] = json_old_config['template']
            }
            if (json_old_config['user_settings'] !== undefined) {
                json_data['user_settings'] = json_old_config['user_settings']
            }
            json_data['role'] = json_old_config['role'];
            json_data['create_date'] = json_old_config['create_date'];
            json_data['user'] = json_old_config['user'];
            json_data['name'] = json_old_config['name'];
            sessionStorage.setItem("config", JSON.stringify(json_data));
            set_login();
        }
    });
}
function unload_template() {
    json_config = {};
    let json_old_config = JSON.parse(sessionStorage.getItem("config"));
    if (json_old_config['template'] !== undefined) {
        json_config['template'] = json_old_config['template']
    }
    if (json_old_config['user_settings'] !== undefined) {
        json_config['user_settings'] = json_old_config['user_settings']
    }
    json_config['role'] = json_old_config['role'];
    json_config['create_date'] = json_old_config['create_date'];
    json_config['user'] = json_old_config['user'];
    json_config['name'] = json_old_config['name'];
    sessionStorage.setItem("config", JSON.stringify(json_config));
    set_login();
}
function get_templates() {
    $.ajax({
        url: "/gettemplates/" + JSON.parse(sessionStorage.getItem('config'))['role'], success: function (json_data) {
            let templates = json_data['templates'];
            if (templates === undefined || templates.length < 1) {
                return;
            }
            if (templates.length > 0) {
                $("#templates option").remove();
                for (index in templates) {
                    $('#templates').append($("<option></option>").attr("value", templates[index]['id']).text(templates[index]['name']));
                }
            }
            $('#template_table tr').remove();
            if (templates.length < 1) {
                row_html = '<tr>';
                row_html += "<td  colspan=2 style='font-size:16px;'>";
                row_html += " No templates made yet"
                row_html += "</td>";
                row_html += "</tr>";
                $('#template_table').append(row_html);
                return;
            }
            for (i in templates) {
                let template = templates[i];
                row_html = '<tr style=" background-color: transparent;" id="row_' + templates['id'] + '" onclick="showmodal(' + template['id'] + ')" class="clickable"';
                row_html += ' >';
                row_html += "<td style='font-size:22px; max-width: 30vw; text-align:center; border: 1px solid black;  '>";
                row_html += template['name'];
                row_html += "</td>";
                row_html += "</tr>";
                $('#template_table').append(row_html);
                $('#template_table tr').hover(function () {
                    $(this).css("background-color", "#444");
                }, function () {
                    $(this).css("background-color", "transparent");
                });
            }
            theme()

            let json_obj_config = JSON.parse(sessionStorage.getItem("config"));
            if (window.location.href.includes("/selectHostTransfer")) {
                if (json_obj_config['user_settings']['standard_template'] !== 'empty' && json_obj_config['user_settings']['standard_template'] !== undefined && json_obj_config['user_settings']['standard_template'] !== null) {
                    console.log($('#templates').val(json_obj_config['user_settings']['standard_template']));
                    $('#templates').val(json_obj_config['user_settings']['standard_template']).change();
                }
                if ($("#templates").val() === "" || $("#templates").val() === null) {
                    $('#templates').prop('selectedIndex', 0);
                }
                if (json_obj_config['user_settings']['always_template']) {
                    json_obj_config["template_name"] = $('#templates').val();
                    load_template();
                }
            }
            if (json_obj_config['template_name'] === undefined)
                $("#template_slider").prop("checked", false);
            else
                $("#template_slider").prop("checked", true);
            $('#templates').change(function () {

                if ($('#template_slider').is(':checked')) {
                    load_template();
                }
            });
            $('#template_slider').change(function () {
                if (this.checked) {
                    load_template();
                } else {
                    unload_template();
                }
            });
        }
    });

}
function get_companies() {
    $.get("/Companies", function (json_data) {
        let companies = json_data['companies'];
        if (companies === undefined) { return }
        if (companies.length > 0) {
            $("#companies option").remove();
            for (index in companies) {
                $('#companies').append($("<option></option>").attr("value", companies[index]['id']).text(companies[index]['name']));
            }
        }
    });
}

function showmodal(id) {
    let json_obj_config = JSON.parse(sessionStorage.getItem("config"));
    $.ajax({
        type: "get",
        url: "/gettemplate/" + id,
        success: function (json_data) {
            $("#saveEditModal").modal("show");
            $('.modalTextInputRow').remove();
            let companie = $("#companies option[value='" + json_data['config_json']['companie'] + "']").text();
            let production = json_data['config_json']['config']['database_p'];
            let test = json_data['config_json']['config']['database_t'];
            let inputs = { 'id': json_data['id'], 'owner': json_data['owner'], 'name': json_data['name'], 'company': companie, 'production': production, 'test': test }
            for (key in inputs) {
                let input_name = key;
                let column_value = inputs[key];
                var $label1 = $("<label>").text(input_name);
                var $label2 = $("<label>").text(column_value);
                var $column_label1 = $("<td>").append($label1).css('border', '1px solid black')
                var $column_label2 = $("<td>").append($label2).css('border', '1px solid black')
                var $row = $("<tr>").attr({ class: 'modalTextInputRow' }).append($column_label1).append($column_label2)
                $('#input_table').append($row);
            }
            if (json_data['owner'] === 'public' && json_obj_config['role'] !== 'admin') {
                $('.deleteEdit').attr('disabled', 'disabled');
                $('.deleteEdit').css("opacity", "0.5");
            }
            $('.deleteEdit').data('id', id);
            $('.deleteEdit').data('owner', json_data['owner']);
            $('.deleteEdit').data('role', json_obj_config['role']);
            theme();
        }
    });

}


function set_login() {
    if (JSON.parse(sessionStorage.getItem('config'))['companie'] === undefined) {
        return;
    }
    $('#companies').val(JSON.parse(sessionStorage.getItem('config'))['companie']).change();
}
function remove_template(json) {
    $.ajax({
        type: "post",
        url: "/deletetemplate",
        data: JSON.stringify(json),
        contentType: 'application/json',
        dataType: 'json',
        error: function () {
            alert("not authorized");
        },
        success: function () {
            get_templates();
        }
    });
}
function init() {
    set_login();
    get_templates();
    get_companies();
    $("#password").trigger( "focus" );
    let json_obj_config = JSON.parse(sessionStorage.getItem("config"));
    $('.deleteEdit').on('click', function () {
        $('#saveEditModal').modal('toggle');
        let id = $(this).data('id');
        let owner = $(this).data('owner');
        let role = $(this).data('role');
        remove_template({ 'id': id, 'owner': owner, 'role': role });

    });
    $("#get_databases").click(function (e) {
        if (!$("#password").val()) {
            alert("first fill in password");
            return;
        }
        json_obj = JSON.parse(sessionStorage.getItem('config'));
        if (json_obj['config'] !== undefined) {
            json_obj_config = json_obj['config'];
        }
        else {
            json_obj_config = {};
        }
        $.get("/Companies", function (json_data) {
            let companies = json_data['companies'];
            for (c in companies) {
                if (companies[c]['id'] == $("#companies option:selected").val()) {
                    json_obj_config['host'] = companies[c]['host'];
                    json_obj_config['port'] = companies[c]['port'];
                    json_obj_config['db_user'] = companies[c]['db_user'];
                    json_obj['companie'] = companies[c]['id'];
                    break;
                }
            }
            let password = $("#password").val();
            json_obj_config['password'] = password;
            json_obj['config'] = json_obj_config;
            sessionStorage.setItem("config", JSON.stringify(json_obj));
            $.ajax({
                type: "post",
                url: "/environment",
                data: sessionStorage.getItem('config'),
                contentType: 'application/json',
                dataType: 'json',
                error: function () {
                    alert("host not found");
                },
                success: function (JSON_string) {
                    if (json_obj['user_settings']['skip_config_settings'] && json_obj['template'] === undefined) {
                        window.location.href = "/overview"
                        return
                    }
                    window.location.href = '/selectEnvironment';
                }
            });
        });

        e.preventDefault();
    });
}
