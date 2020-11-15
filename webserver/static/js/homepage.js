function create_template() {
    let json_obj_config = JSON.parse(sessionStorage.getItem('config'));
    json_obj_config['template'] = true;
    sessionStorage.setItem("config", JSON.stringify(json_obj_config));
    window.location.href = '/selectHost'
}
function init() {
    var transfers;
    let row_html = '<tr  id="row_title"  >';
    row_html += "<th colspan='3' style='font-size:20px;text-align:center; '>";
    row_html += "Last 5 transfers";
    row_html += "</th>";
    row_html += "</tr>";
    $('#history_table').append(row_html);
    $.get("/transfers", function (json_data) {
        transfers = json_data['transfers'];
        if(transfers.length<1){
            row_html = "<td colspan='3' style='font-size:12px;text-align:center'>";
            row_html += "No transfers made";
            row_html += "</td>";
            $('#history_table').append(row_html);
        }
        for (i in transfers) {
            if(i>4){
                break;
            }
            let transfer = transfers[i];
            let json_transfer = transfer["config_json"]
            let config = json_transfer["config"]
            row_html = '<tr id="row_' + transfer['id'] + '" style="font-size: 12px;background-color:whitesmoke"> ';
            row_html += "<td>";
            row_html += transfer['date'];
            row_html += "</td>";
            row_html += "<td>";
            row_html += config['database_p'];
            row_html += "</td>";
            row_html += "<td>";
            row_html += config['database_t'];
            row_html += "</td>";

            row_html += "</tr>";
            $('#history_table').append(row_html);
        }
    $('#history_table td').css("border", "1px solid")
    $('#history_table tr').css("border", "0px")
    theme();
    });
    row_html = '<tr  id="row_title"  >';
    row_html += "<th colspan='3' style='font-size:20px;text-align:center;'>";
    row_html += "User info";
    row_html += "</th>";
    row_html += "</tr>";
    $('#user_table').append(row_html);
    let json_obj_config = JSON.parse(sessionStorage.getItem("config"));
    row_html = '<tr style="font-size: 12px;"> ';
    row_html += "<td>";
    row_html += 'Username';
    row_html += "</td>";
    row_html += "<td>";
    row_html += json_obj_config['user'];
    row_html += "</td>";
    row_html += "</tr>";
    $('#user_table').append(row_html);
    row_html = '<tr style="font-size: 12px"> ';
    row_html += "<td>";
    row_html += 'Name';
    row_html += "</td>";
    row_html += "<td>";
    row_html += json_obj_config['name'];
    row_html += "</td>";
    row_html += "</tr>";
    $('#user_table').append(row_html);
    row_html = '<tr style="font-size: 12px;"> ';
    row_html += "<td>";
    row_html += 'Account created';
    row_html += "</td>";
    row_html += "<td>";
    row_html += json_obj_config['create_date'];
    row_html += "</td>";
    row_html += "</tr>";
    $('#user_table').append(row_html);
    row_html = '<tr style="font-size: 12px"> ';
    row_html += "<td>";
    row_html += 'Role';
    row_html += "</td>";
    row_html += "<td>";
    row_html += json_obj_config['role'];
    row_html += "</td>";
    row_html += "</tr>";
    $('#user_table').append(row_html);

    $('#user_table td').css("border", "1px solid")
    $('#user_table tr').css("background-color", "whitesmoke")
    $('#user_table tr').css("border", "0px")
    
    if(json_obj_config['role']=='admin'){
        $("#button_div").append(`<button class="mainButton" onclick="window.location.href ='/companies'"
        style="background-color: rgb(121, 42, 86);">Add/Edit Companies</button><br>`)
        $("#button_div").append(`<button class="mainButton" onclick="window.location.href ='/users'"
        style="background-color: rgb(121, 113, 42);">View Users</button><br>`)
    }
    theme();

}

