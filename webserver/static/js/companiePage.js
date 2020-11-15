function load_page(href) {
    window.location.href = href;
}


function showModal(id) {
    $("#saveEditModal").modal("show");
    $('#input_table tr').remove();
    $('#saveEditModalLabel').text("User Info")
    $('#companie_table th').each(function () {
        let input_name = $(this).text()
        let index = $('#companie_table th').index($(this));
        let column_value = $('#row_' + id + ' td').eq(index).text();
        var $label = $("<label>").text(input_name);
        if (input_name.includes("id") && id > 0) {
            var $input = $('<input style= "background-color:#e9ecef; color:#adb5bd" readonly>').attr({ type: 'text', id: 'input_' + input_name, title: column_value, name: 'input_' + input_name, class: 'edit_input auto_expand', value: column_value });
        }
        else {
            if (input_name.includes("id")) {
                return;
            }
            var $input = $('<input>').attr({ id: 'input_' + input_name, name: 'input_' + input_name, title: column_value, class: 'edit_input', value: column_value });
        }
        var $column_label = $("<td>").append($label)
        var $column_input = $("<td>").append($input)
        var $row = $("<tr>").attr({ class: 'modalTextInputRow' }).append($column_label).append($column_input)
        if (id < 0) {
            $('.saveEdit').text('Add');
        }
        else {
            $('.saveEdit').text('Save');
        }
        $('#input_table').append($row);
        $("#input_" + input_name).on('input',function () {
            let filled = true;
            $('#input_table tr').each(function () {
                if ($(this).find('td:eq(1) input').val() == "") {
                    filled = false;
                }
            })
            if (filled) {
                $('.saveEdit').removeAttr('disabled');
                $('.saveEdit').css("opacity", "1");
                $("#saveEdit").removeClass("disable");

            }
        });
        $('.saveEdit').data('id', id);
        $('.deleteEdit').data('id', id);
        $('.saveEdit').attr('disabled', 'disabled');
        $('.saveEdit').css("opacity", "0.5")
        $("#saveEdit").addClass("disable");

    });

    theme();
}


function setCompanies() {
    $.ajax({
        url: "/Companies",
        success: function (json_data) {
    $('#companie_table tr').remove();
    let companies = json_data['companies'];
    let row_html = "<tr id='row_headers'>";
    for (key in companies[0]) {
        if (whatIsIt(companies[0][key]) == 'O') {
            for (key1 in companies[0][key]) {
                row_html += "<th>";
                row_html += key1;
                row_html += "</th>";
            }
            continue;
        }
        row_html += "<th>";
        row_html += key;
        row_html += "</th>";
    }
    row_html += "</tr>";
    $('#companie_table').append(row_html);

    for (i in companies) {
        let search_name = $("#search").val();
        if(search_name!="")
        {
            if(!companies[i]['name'].includes(search_name))
            {
                continue;
            }
        }
        row_html = "<tr class='clickable' onclick='showModal(`" + companies[i]['id'] + "`)' id='row_" + companies[i]['id'] + "'>";
        for (key in companies[i]) {
            if (whatIsIt(companies[i][key]) == 'O') {
                for (key1 in companies[i][key]) {
                    row_html += "<td>";
                    row_html += companies[i][key][key1];
                    row_html += "</td>";
                }
                continue;
            }
            row_html += "<td>";
            row_html += companies[i][key];
            row_html += "</td>";

        }
        row_html += "</tr>";
        $('#companie_table').append(row_html);
    }
    if($("#companie_table tr").length<2){
        row_html = '<tr> ';
        row_html += "<td colspan='5' style='text-align:center'>";
        row_html += " No companies found"
        row_html += "</td>";
        row_html += "</tr>";
        $('#companie_table').append(row_html);
        return;
    }
    theme();
}
    });
}

function init() {
    $("#search").trigger( "focus" );
    $('.deleteEdit').on('click', function () {
        $('#saveEditModal').modal('toggle');
        let id = $(this).data('id');
        res = {};
        $.ajax({
            type: "DELETE",
            url: "/Companies/" + id,
            error: function () {
                alert("error");
            },
            success: function () {
                $('#row_'+id).remove();
                setCompanies()
            },
        });
    });
    $('.saveEdit').on('click', function () {
        $('#saveEditModal').modal('toggle');
        res = {};
        $('#input_table tr').each(function () {
            res[$(this).find('td:eq(0) label').text()] = $(this).find('td:eq(1) input').val();
        });
        if ($('.saveEdit').data("id") < 0) {
            res['id'] = -1;
        }
        $.ajax({
            type: "POST",
            url: "/Companies",
            data: JSON.stringify(res),
            contentType: 'application/json',
            dataType: 'json',
            error: function () {
                alert("error");
            },
            success: function () {
                setCompanies()
            },
        });
    });
    setCompanies()
}
$(document).ready(function () {

    var timeout = null;
    $('#search').on('input', function () {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
           setCompanies()
        }, 300);
    });
});