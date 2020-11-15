function load_page(href) {
    window.location.href = href;
}

function showModal(index, action) {
    $("#saveEditModal").modal("show");
    $('.modalTextInputRow').remove();
    $('#input_table tr').remove();
    $('.deleteEdit').data('index', index);
    $('.deleteEdit').data('action', action);
    let json_config = JSON.parse(sessionStorage.getItem('config'));
    let list = [];
    let act = {};
    if (action == 0) {
        list = json_config['update'];
        act = list[index];
        $('#saveEditModalLabel').text('Changed row values');
    }
    else
        if (action == 1) {
            list = json_config['remove']
            act = list[index]['data']
            $('#saveEditModalLabel').text('Deleted row values');
        }
    row_html = '<tr>'
    row_html += "<th >";
    row_html += "Column";
    row_html += "</th>";
    row_html += "<th>";
    row_html += "Value";
    row_html += "</th>";
    if (action == 0) {
        row_html += "<th>";
        row_html += "Changed";
        row_html += "</th>";
    }
    row_html += "</tr>";
    $('#input_table').append(row_html);
    for (key in act) {
        if (key.endsWith("_changed") || action != 0) {
            row_html = '<tr>'
            row_html += "<td >";
            row_html += key.replace('_changed', '');
            row_html += "</td>";
            row_html += "<td>";
            row_html += act[key.replace('_changed', '')];
            row_html += "</td>";
            if (action == 0) {
                row_html += "<td>";
                row_html += act[key];
                row_html += "</td>";
            }
            row_html += "</tr>";
            $('#input_table').append(row_html);
        }

    }
    theme();
}

function load_overview() {
    $('#overview_table tr').remove();
    let json_config = JSON.parse(sessionStorage.getItem('config'));
    th_rows = ["Action", "Value"];
    let row_html = '<tr id="row_headers">';
    th_rows.forEach(function (item, index) {

        row_html += "<th>";
        row_html += item;
        row_html += "</th>";
    });
    row_html += "</tr>";

    $('#overview_table').append(row_html);
    let config_list = json_config['config'];
    if (!json_config['config']) {
        alert('error first fill in values')
        let json_config = JSON.parse(sessionStorage.getItem('config'));
        if (json_config['template']) {
            window.location.href = '/selectHostTemplate';
        }
        else {
            window.location.href = '/selectHostTransfer';
        }
    }
    jQuery.each(config_list, function (key, val) {
        row_html = '<tr id="row_config_' + key;
        row_html += 'style="width=5%">';
        row_html += "<td class=update>";
        row_html += "Set value of " + key;
        row_html += "</td>";
        row_html += "<td class=update >";
        row_html += key + "='" + val + "'";
        row_html += "</td>";
        row_html += "</tr>";
        $('#overview_table').append(row_html);
    });
    let update_list = json_config['update'];
    let remove_list = json_config['remove'];
    for (i in update_list) {
        let update = update_list[i];
        for (key in update) {
            if (key.endsWith("_changed") && update[key] == 'true') {
                row_html = '<tr id="row_update_' + update_list[i]["row_id"] + '"';
                row_html += ' onclick=showModal(' + i + ',0) style="width=5%" class="clickable">';
                row_html += "<td class=update >";
                row_html += "Update r#=" + update['row_id'] + " on '" + update["table"] + "'";
                row_html += "</td>";
                row_html += "<td class=update >";
                for (key in update) {
                    if (key.endsWith("_changed") && update[key] == 'true') {
                        row_html += key.replace('_changed', '') + "='" + update[key.replace('_changed', '')] + "', ";
                    }
                }
                row_html = row_html.slice(0, -2);
                row_html += "</td>";
                row_html += "</tr>";
                $('#overview_table').append(row_html);
                break;
            }
        }
    }
    for (i in remove_list) {
        let remove = remove_list[i];
        row_html = '<tr onclick=showModal(' + i + ',1) class="clickable" id="row_remove_' + remove["table"] + '_' + remove["row_id"] + '"';
        row_html += ' style="width=5%">';
        row_html += "<td class=remove >";
        row_html += "Remove row on '" + remove["table"] + "'";
        row_html += "</td>";
        row_html += "<td class=remove >";
        row_html += "row id='" + remove["row_id"] + "'";
        row_html += "</td>";
        row_html += "</tr>";
        $('#overview_table').append(row_html);
    }
    theme();
}
function save_template() {
    if ($('#template_slider').is(':checked') || JSON.parse(sessionStorage.getItem('config'))["template"] !== undefined) {
        if ($("#template_name").val() === null || $("#template_name").val() === "" || $("#template_name").val() === undefined) {
            alert("no template name given");
        }
        else {
            json_config = JSON.parse(sessionStorage.getItem('config'));
            let create_database = true;
            if (json_config["template"] !== undefined) {
                create_database = false;
                delete json_config["template"];
            }
            delete json_config['template'];
            delete json_config['config']["password"];
            delete json_config['create_date'];
            delete json_config['role'];
            delete json_config['user_settings'];
            if ($('#public_slider').is(':checked')) {
                json_config["user"] = 'public';
            }
            json_config["template_name"] = $("#template_name").val();
            $.ajax({
                type: "POST",
                url: "/savetemplate",
                data: JSON.stringify(json_config),
                contentType: 'application/json',
                dataType: 'json',
                error: function () {
                    alert("error");
                },
                success: function () {
                    if (create_database)
                        createDatabase();
                    else {
                        load_page('/');
                    }
                }
            });
        }
    }
    else {
        createDatabase();
    }
}
function createDatabase() {
    json_obj = JSON.parse(sessionStorage.getItem('config'));
    if ($("#email_slider").is(':checked')) {
        json_obj['action'] = 'email';
        json_obj['emails'] = $("#email_adress").val();
        $.ajax({
            type: "put",
            url: "/database",
            data: JSON.stringify(json_obj),
            contentType: 'application/json',
            dataType: 'json',
            error: function () {
                alert("error");
            },
            success: function () {
                load_page('/');
            }

        });
        return
    }
    $("#overview_table").remove();
    $("#back").remove();
    $('.switch').remove();
    $('#label_template_slider').remove();
    $("#create_database").remove();
    $('#template_slider').remove();
    $('#template_name').remove();
    $('#label_public_slider').remove();
    $('#template_switch').remove();
    $('#public_switch').remove();
    $('#email_slider').remove();
    $('#email_adress').remove();
    let table_div = $("#table_div");
    table_div.append('<label id="progress_bar_text"> data dump aanmaken... </label><br>');
    table_div.append('<progress id="progress_bar" value="0" max="100"></progress>');
    table_div.append('<label id="progress_bar_label"> 0% </label>')


    json_obj['action'] = 'data_dump_aanmaken';
    let value = $("#progress_bar").val();
    
    $.ajax({
        type: "put",
        url: "/database",
        data: JSON.stringify(json_obj),
        contentType: 'application/json',
        dataType: 'json',
        error: function () {
            alert("error");
        },
        success: function () {
            value = $("#progress_bar").val();
            $("#progress_bar").val(value + 20);
            $("#progress_bar_label").text((value + 20).toString() + "%");
            $("#progress_bar_text").text("restoring data dump...");
            json_obj['action'] = 'restore_data_dump';
            $.ajax({
                type: "put",
                url: "/database",
                data: JSON.stringify(json_obj),
                contentType: 'application/json',
                dataType: 'json',
                error: function () {
                    alert("error");
                },
                success: function () {
                    value = $("#progress_bar").val();
                    $("#progress_bar").val(value + 20);
                    $("#progress_bar_label").text((value + 20).toString() + "%");
                    $("#progress_bar_text").text("getting database ready for testing...");
                    json_obj['action'] = 'set_settings';
                    $.ajax({
                        type: "put",
                        url: "/database",
                        data: JSON.stringify(json_obj),
                        contentType: 'application/json',
                        dataType: 'json',
                        error: function () {
                            alert("error");
                        },
                        success: function () {
                            value = $("#progress_bar").val();
                            $("#progress_bar").val(value + 20);
                            $("#progress_bar_label").text((value + 20).toString() + "%");
                            $("#progress_bar_text").text("updating edited values...");
                            json_obj['action'] = 'update_ids';
                            $.ajax({
                                type: "put",
                                url: "/database",
                                data: JSON.stringify(json_obj),
                                contentType: 'application/json',
                                dataType: 'json',
                                error: function () {
                                    alert("error");
                                },
                                success: function () {
                                    value = $("#progress_bar").val();
                                    $("#progress_bar").val(value + 20);
                                    $("#progress_bar_label").text((value + 20).toString() + "%");
                                    $("#progress_bar_text").text("removing deleted values...");
                                    json_obj['action'] = 'remove_ids';
                                    $.ajax({
                                        type: "put",
                                        url: "/database",
                                        data: JSON.stringify(json_obj),
                                        contentType: 'application/json',
                                        dataType: 'json',
                                        error: function () {
                                            alert("error");
                                        },
                                        success: function () {
                                            value = $("#progress_bar").val();
                                            $("#progress_bar").val(value + 20);
                                            $("#progress_bar_text").text("Done!");
                                            $("#progress_bar_label").text((value + 20).toString() + "%");
                                            $("#finish").css("visibility", " visible");
                                            $("#finish").css("display", " inline");
                                            $("#finish").css("position", "relative");
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}
function init() {

    $("#template_slider").prop("checked", false);
    $("#email_slider").prop("checked", false);
    if ($("#email_adress").val() !== "") {
        $('#email_slider').removeAttr('disabled');
        $('#email_switch').css("opacity", "1");
    } else {
        $('#email_slider').attr('disabled', 'disabled');
        $('#email_switch').css("opacity", "0.5");
    }
    if ($('#template_name').val() !== "") {
        $('#template_slider').removeAttr('disabled');
        $('#template_switch').css("opacity", "1");
    } else {
        $('#template_slider').attr('disabled', 'disabled');
        $('#template_switch').css("opacity", "0.5");
    }
    $("#template_slider").change(function () {
        if ($("#template_slider").is(':checked')) {
            $('#public_slider').removeAttr('disabled');
            $('#public_switch').css("opacity", "1");
        } else {
            $('#public_slider').attr('disabled', 'disabled');
            $('#public_switch').css("opacity", "0.5");
        }
    });
    $("#template_name").on('input', function () {
        if ($(this).val() !== "") {
            $('#template_slider').removeAttr('disabled');
            $('#template_switch').css("opacity", "1");
            $("#template_slider").prop("checked", true);
            $('#public_slider').removeAttr('disabled');
            $('#public_switch').css("opacity", "1");
        } else {
            $('#template_slider').attr('disabled', 'disabled');
            $('#template_switch').css("opacity", "0.5");
            $("#template_slider").prop("checked", false);
            $('#public_slider').attr('disabled', 'disabled');
            $('#public_switch').css("opacity", "0.5");
        }
    });
    $("#email_adress").on('input', function () {
        if ($(this).val() !== "" && $(this).val().includes("@")) {
            $('#email_slider').removeAttr('disabled');
            $('#email_switch').css("opacity", "1");
            $("#email_slider").prop("checked", true);

        } else {
            $('#email_slider').attr('disabled', 'disabled');
            $('#email_switch').css("opacity", "0.5");
            $("#email_slider").prop("checked", false);

        }
    });
    let json_obj_config = JSON.parse(sessionStorage.getItem("config"));
    if (json_obj_config["template"] !== undefined) {
        $("#create_database").text("create template");
        $('#template_switch').remove();
        $('#label_template_slider').remove();
        $("#transfer").removeClass("selected");
        $("#template").addClass("selected");
        $("h1").text("Overview template setting");
        $('#email_adress').remove();
        $('#label_email_slider').remove();
        $('#email_switch').remove();
        if(json_obj_config["user_settings"]["theme"]==='color')
        $(".header").css("background-color", "rgb(96, 42, 121)");
    } else {
        $('#public_slider').attr('disabled', 'disabled');
        $('#public_switch').css("opacity", "0.5")
    }
    $('.deleteEdit').on('click', function () {
        $('#saveEditModal').modal('toggle');
        let index = $(this).data('index');
        let json_config = JSON.parse(sessionStorage.getItem('config'));
        let action = "";
        if ($(this).data('action') == 0) {
            action = 'update';
        }
        if ($(this).data('action') == 1) {
            action = 'remove';
        }
        let list = json_config[action]
        list.splice(index, 1);
        json_config[action] = list
        sessionStorage.setItem('config', JSON.stringify(json_config))
        load_overview()

    });
    load_overview()
}
