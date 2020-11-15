function load_page(href) {
    window.location.href = href;
}

function showModal(username) {
    $("#saveEditModal").modal("show");
    $('#input_table tr').remove();
    $('.saveEdit').data('user', username);
    $('#saveEditModalLabel').text("User Info")
    $('#user_table th').each(function () {
        let input_name = $(this).text()
        let index = $('#user_table th').index($(this));
        let column_value = $('#row_' + username + ' td').eq(index).text()
        var $label = $("<label>").text(input_name + ':');
        var $input = $('<select>').attr({ id: 'input_' + input_name, name: 'input_' + input_name, title: column_value, class: 'edit_input', value: column_value });

        if (input_name !== 'Role') {
            $input = $("<label>").text(column_value);
        } else {
            var roles = [
                { val: 'user', text: 'user' },
                { val: 'admin', text: 'admin' },
            ];
            $(roles).each(function () {
                $input.append($("<option>").attr('value', this.val).text(this.text));
            });
            $input.val(column_value).change();
        }
        var $column_label = $("<td>").append($label)
        var $column_input = $("<td>").append($input)
        var $row = $("<tr>").attr({ class: 'modalTextInputRow' }).append($column_label).append($column_input)
        $('#input_table').append($row);
        $("#input_" + input_name).change(function () {
            $('.saveEdit').removeAttr('disabled');
            $("#saveEdit").removeClass("disable");
            $('.saveEdit').css("opacity", "1");
            $('.saveEdit').css("border", "2px solid #0a5cb4;")
        });
        $('.saveEdit').data('username', username);
        $('.saveEdit').attr('disabled', 'disabled');
        $("#saveEdit").addClass("disable");
        $('.saveEdit').css("opacity", "0.5")
        $('.saveEdit').css("border", "0px")
    });

    theme();
}

function set_users() {
    $.ajax({
        url: "/Users", success: function (json_data) {
            let users = json_data['users'];
            $('#user_table tr').remove();
            let json_config = JSON.parse(sessionStorage.getItem('config'));
            th_rows = ["Username", "Join date", "Role", "Last transfer", "Last time online"];
            let row_html = '<tr id="row_headers">';
            th_rows.forEach(function (item, index) {

                row_html += "<th>";
                row_html += item;
                row_html += "</th>";
            });
            row_html += "</tr>";
            theme();
            $('#user_table').append(row_html);
            for (i in users) {
                let user = users[i];
                let search_user = $("#search").val();

                if (search_user != "") {
                    if (!user['username'].includes(search_user)) {
                        continue;
                    }
                }
                if (users[i]['username'] === json_config['user'])
                    continue
                row_html = "<tr class='clickable' onclick='showModal(`" + users[i]['username'].split("@")[0] + "`)' id='row_" + users[i]['username'].split("@")[0] + "'>";
                for (key in users[i]) {
                    row_html += "<td class='values' >";
                    row_html += users[i][key];
                    row_html += "</td>";
                }
                row_html += "</tr>";
                $('#user_table').append(row_html);
            }
            if ($("#user_table tr").length < 2) {
                row_html = '<tr> ';
                row_html += "<td colspan='5' style='text-align:center'>";
                row_html += " No users found with current search values"
                row_html += "</td>";
                row_html += "</tr>";
                $('#user_table').append(row_html);
                return;
            }
            theme();
        }
    });
}

function init() {
    $('.saveEdit').on('click', function () {
        $('#saveEditModal').modal('toggle');
        let username = $(this).data('username');
        let role = $("#input_Role option:selected").val();
        $.ajax({
            type: "POST",
            url: "/Users",
            data: JSON.stringify({ "username": username, "role": role }),
            contentType: 'application/json',
            dataType: 'json',
            error: function () {
                alert("error");
            },
            success: function () {
                set_users()
            },
        });
    });
    set_users()
}

$(document).ready(function () {
    $("#search").trigger( "focus" );
    var timeout = null;
    $('#search').on('input', function () {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            init()
        }, 300);
    });
    $('#end').on('input', function () {
        init()
    });
    $('#start').on('input', function () {
        init()
    });
});
