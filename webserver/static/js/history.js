function load_page(href) {
    window.location.href = href;
}

function init() {
    $.ajax({
        url: "/transfers", success: function (json_data) {
            let config_json = JSON.parse(sessionStorage.getItem('config'))
            $('#history_table tr').remove();
            let transfers = json_data['transfers'];
            if (config_json['role'] === 'admin') {
                th_rows = ["Date", "Time", "User", "Production", "Test", "Template"];

            } else {
                th_rows = ["Date", "Time", "Production", "Test", "Template"];
            }
            let row_html = '<tr id="row_headers">';
            th_rows.forEach(function (item, index) {
                row_html += "<th class='cell_header'>";
                row_html += item;
                row_html += "</th>";
            });
            row_html += "</tr>";
            $('#history_table').append(row_html);
            if (transfers.length < 1) {
                row_html = '<tr';
                row_html += ' style="width=5%;">';
                row_html += "<td colspan='6' style='text-align:center'>";
                row_html += " No transfers made yet"
                row_html += "</td>";
                row_html += "</tr>";
                $('#history_table').append(row_html);
                return;
            }
            for (i in transfers) {
                let transfer = transfers[i];
                let search_user = $("#search").val();
                let value_start_date = new Date($("#start").val());
                let value_end_date = new Date($("#end").val());
                let transfer_date = new Date(transfer['date']);
                if (!(transfer_date > value_start_date && transfer_date <= value_end_date)) {
                    continue;
                }

                if (search_user != "") {
                    if (!transfer['username'].includes(search_user)) {
                        continue;
                    }
                }
                let json_transfer = transfer["config_json"]
                row_html = '<tr id="row_' + transfer['id'] + '"';
                let config = json_transfer["config"]

                row_html += ' style="width=5%">';
                row_html += "<td>";
                row_html += transfer['date'];
                row_html += "</td>";
                row_html += "<td>";
                row_html += transfer['time'];
                row_html += "</td>";
                if (JSON.parse(sessionStorage.getItem('config'))['role'] === 'admin') {
                    row_html += "<td>";
                    row_html += transfer['username'];
                    row_html += "</td>";
                }
                row_html += "<td>";
                row_html += config['database_p'];
                row_html += "</td>";
                row_html += "<td>";
                row_html += config['database_t'];
                row_html += "</td>";
                row_html += "<td>";
                if (json_transfer['template_name'] !== undefined) {
                    row_html += json_transfer['template_name'];
                } else {
                    row_html += "No template";
                }
                row_html += "</td>";
                row_html += "</tr>";
                $('#history_table').append(row_html);
            }
            if ($("#history_table tr").length < 2) {
                row_html = '<tr';
                row_html += ' style="width=5%;">';
                row_html += "<td colspan='6' style='text-align:center'>";
                row_html += " No transfers found with current search"
                row_html += "</td>";
                row_html += "</tr>";
                $('#history_table').append(row_html);
            }
            theme()
        }
    });
}

$(document).ready(function () {
    $("#search").trigger( "focus" );
    $.ajax({
        url: "/transfers", success: function (json_data) {
            let transfers = json_data['transfers'];
            var create_date = null;
            var cdate = null;
            for (i in transfers) {
                let transfer = transfers[i];
                var temp_date = new Date(transfer['date'])
                if (create_date === null || create_date.getTime() > temp_date.getTime()) {
                    create_date = new Date(temp_date);
                    create_date.setDate(create_date.getDate() - 1);
                    if (create_date.getDate() < 10)
                        cdate = create_date.getFullYear() + '-' + (create_date.getMonth() + 1) + '-0' + create_date.getDate();
                    else
                        cdate = create_date.getFullYear() + '-' + (create_date.getMonth() + 1) + '-' + create_date.getDate();
                }
                $('#start').val(cdate);
            }
            let config_json = JSON.parse(sessionStorage.getItem('config'))
            var now = new Date();
            var create_date = new Date(config_json['create_date']);
            if (now.getDate() < 10)
                var today = now.getFullYear() + '-' + (now.getMonth() + 1) + '-0' + now.getDate();
            else
                var today = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
            if (create_date.getDate() < 10)
                var cdate = create_date.getFullYear() + '-' + (create_date.getMonth() + 1) + '-0' + create_date.getDate();
            else
                var cdate = create_date.getFullYear() + '-' + (create_date.getMonth() + 1) + '-' + create_date.getDate();
            $('#end').val(today);
            $('#start').attr('max', today);
            $('#end').attr('max', today);
        }
    })
    var timeout = null;
    $('#search').on('input', function () {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            init()
        }, 300);
    });
    $('#end').on('change', function () {
        init()
    });
    $('#start').on('change', function () {
        init()
    });
});