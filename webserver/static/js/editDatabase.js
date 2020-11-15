function load_page(href) {
  window.location.href = href;
}
function remove_row(row_id, selected_table) {
  json_obj = {};
  data = {};
  $('#row_names th.row_headers').each(function () {
    let name = $(this).text()
    let index = $('#row_names th').index($(this));
    let value = $('#row_' + row_id + ' td').eq(index).text()
    data[name] = value;
  });
  json_obj['table'] = selected_table;
  json_obj['data'] = data;
  json_obj['row_id'] = row_id;
  json_obj_config = JSON.parse(sessionStorage.getItem('config'));
  let list_remove = [];
  if (json_obj_config.hasOwnProperty('remove')){
    list_remove = json_obj_config['remove']
  }
  let temp = JSON.parse(sessionStorage.getItem('config'));
  temp['remove'] = [json_obj];

  $.ajax({
    type: "POST",
    url: "/checkRemove",
    data: JSON.stringify(temp),
    contentType: 'application/json',
    dataType: 'json',
    error: function () {
      alert("Cannot remove row: ForeignKey Violation");
    },
    success: function () {
      list_remove.push(json_obj);
      json_obj_config['remove'] = list_remove;
      sessionStorage.setItem('config', JSON.stringify(json_obj_config));
      $("#row_" + row_id).remove();
    },
  });


}
function load_tables() {
  $.ajax({
    type: "POST",
    url: "/database",
    data: sessionStorage.getItem('config'),
    contentType: 'application/json',
    dataType: 'json',
    error: function () {
      alert('error no test database selected')
      let json_config = JSON.parse(sessionStorage.getItem('config'));
      if(json_config['template']){
          window.location.href = '/selectHostTemplate';
      }
      else{
          window.location.href = '/selectHostTransfer';
      }
    },
    success: function (JSON_string) {
      let JSONobject = JSON.parse(JSON_string);
      let tables = JSONobject['tables'];
      $("#select_table option").remove();
      for (index in tables) {
        $('#select_table').append($("<option></option>").attr("value", tables[index]).text(tables[index]));
      }
      load_rows($("#select_table option:selected").val(), true)
    }
  });
}
function load_rows(table, reload_search) {
  json_obj = JSON.parse(sessionStorage.getItem('config'));
  json_obj["selected_table"] = table;
  $.ajax({
    type: "POST",
    url: "/tables",
    data: JSON.stringify(json_obj),
    contentType: 'application/json',
    dataType: 'json',
    error: function () {
      alert('error no test database selected')
      let json_config = JSON.parse(sessionStorage.getItem('config'));
      if(json_config['template']){
          window.location.href = '/selectHostTemplate';
      }
      else{
          window.location.href = '/selectHostTransfer';
      }
    },
    success: function (JSON_string) {
      let JSONobject = JSON.parse(JSON_string);
      let rows = JSONobject['rows'];
      $('#database_table tr').remove();
      let standard_length = rows[0].length
      let search_index = 0;
      let search = true;
      let selected_search = $("#select_column option:selected").val();
      let search_value = $("#search").val();
      if (reload_search) {
         $("#select_column option").remove(); 
        }
      let update_list = json_obj['update']
      let remove_list = json_obj['remove']
      let update_ids = []
      for (update in update_list) {
        if (update_list[update]["table"] == table) {
          update_ids.push(update_list[update]["row_id"]);
        }
      }
      let remove_ids = []
      for (remove in remove_list) {
        if (remove_list[remove]["table"] == table) {
          remove_ids.push(remove_list[remove]["row_id"]);
        }
      }

      row_names = []
      var i;
      var l = rows.length;
      let db_table = $('#database_table');
      let row_html = "";
      let total_table = "";
      for (i = 0; i < l; i++) {
        search = true;
        let row_values = rows[i];
        if (remove_ids.indexOf(parseInt(i)) != -1) {
          continue;
        }
        if (i > 0) {
          row_html = '<tr class="clickable" onclick=showModal(' + i + ') id="row_'
          row_html += i + '" >';
        } else {
          row_html = '<tr id="row_'
          row_html += 'names" style="width=5%">';
        }
        var i1;
        var l1 = row_values.length;
        for (i1 = 0; i1 < l1; i1++) {
          let value = row_values[i1];
          if (i > 0) {
            if (i1 < 1) {
              row_html += "<td class='row_id' style='background-color:#555;color:white; border: 0;text-align:center; padding:1px'>";
              row_html += i;
              row_html += "</td>";
            }
            row_html += "<td class='" + row_names[i1] + " values' >";
            if (update_ids.indexOf(parseInt(i)) != -1) {

              for (update in update_list) {
                if (parseInt(update_list[update]["row_id"]) == parseInt(i)) {
                  if (update_list[update][row_names[i1]] !== undefined) {
                    value = update_list[update][row_names[i1]];
                  }
                }
              }
            }
            if (i1 == search_index) {
              if (!value.toLowerCase().includes(search_value.toLowerCase())) {
                search = false;
              }
            }
            value = value.replaceAll('<', "&lt;");
            row_html += value;
            row_html += "</td>";

          } else {
            if (i1 < 1) {
              row_html += "<th class='row_id' style='text-align:center; padding:0;background-color:#555; padding:1px'>";
              row_html += "r#";
              row_html += "</th>";
            }
            if (row_values[i1] == selected_search) {
              search_index = i1;
            }
            if (reload_search) { 
              $('#select_column').append($("<option></option>").attr("value", row_values[i1]).text(row_values[i1])); 
            }
            row_names.push(row_values[i1]);
            row_html += "<th class='row_headers'>";
            row_html += row_values[i1];
            row_html += "</th>";
          }
        }
        row_html += "</tr>";
        if (search) {
          total_table += row_html;
        }
      }
      console.log(total_table)
      db_table.append(total_table);
      theme()
    }
  });
  
}
function showModal(id) {
  $("#saveEditModal").modal("show");
  $('.modalTextInputRow').remove();
  $('#row_names th.row_headers').each(function () {
    let input_name = $(this).text()

    if (["id", "create_date", "write_date", "create_uid", "write_uid"].includes(input_name)) {
      return true;
    }

    let index = $('#row_names th.row_headers').index($(this));
    let column_value = $('#row_' + id + ' td.values').eq(index).text()
    var $label = $("<label>").text(input_name + ':');

    if (input_name.includes("_id")) {
      var $input = $('<input style= "background-color:#e9ecef; color:#adb5bd" readonly>').attr({type: 'text', id: 'input_' + input_name, title: column_value, name: 'input_' + input_name, class: 'edit_input auto_expand', value: column_value});
    }
    else {
      var $input = $('<input>').attr({ id: 'input_' + input_name, name: 'input_' + input_name, title: column_value, class: 'edit_input', value: column_value });
    }

    var $column_label = $("<td>").append($label)
    var $column_input = $("<td>").append($input)
    var $row = $("<tr>").attr({ class: 'modalTextInputRow' }).append($column_label).append($column_input)
    $('#input_table').append($row);
    $("#input_" + input_name).on('input',function () {
      $('.saveEdit').removeAttr('disabled');
      $('.saveEdit').css("opacity", "1");
      $("#saveEdit").removeClass("disable");
    });
  });
  $('.saveEdit').data('id', id);
  $('.saveEdit').attr('disabled', 'disabled');
  $("#saveEdit").addClass("disable");
  $('.saveEdit').css("opacity", "0.5")
  $('.deleteEdit').data('id', id);
}

function saveNote(id) {
  let json_obj = {}
  let row_values = {};
  let json_config = JSON.parse(sessionStorage.getItem('config'));
  let update_list = json_config['update']
  for(i in update_list){
    if(id == update_list[i]["row_id"]){
      json_obj = update_list[i] 
      update_list.splice(i, 1);
    }
  }
  json_config['update'] = update_list
  $('#row_names th.row_headers').each(function () {
    let index = $('#row_names th.row_headers').index($(this));
    let column_value = $('#row_' + id + ' td.values').eq(index).text()
    row_values[$(this).text()] = column_value;
  });
  $('.modalTextInputRow').each(function () {
    let name = $(this).eq(0).text().slice(0, -1);
    let value = undefined;
    $(this).find("td input:text,td select").each(function () {
      value = this.value;
    });

    if (row_values[name] == value) {
      if(json_obj[name+ "_changed"] === undefined || json_obj[name+ "_changed"] === 'false')
      {
        json_obj[name + "_changed"] = 'false';
    }
    } else {
      $('tr#row_' + id + ' td.' + name).text(value);
      json_obj[name + "_changed"] = 'true';
    }
    json_obj['row_id'] = id;
    json_obj[name] = value;
    if (row_values['id'] == undefined) {
      json_obj['id'] = "undefined";
    }
    else {
      json_obj['id'] = row_values['id'];
    }
  });
  json_obj['table'] = $("#select_table option:selected").val();
  json_obj_config = json_config;
  let list_updates = [];
  if (json_obj_config.hasOwnProperty('update'))
    list_updates = json_obj_config['update'];
  let temp = JSON.parse(sessionStorage.getItem('config'));
  temp['update'] = [json_obj];

  $.ajax({
    type: "POST",
    url: "/checkUpdate",
    data: JSON.stringify(temp),
    contentType: 'application/json',
    dataType: 'json',
    error: function () {
      load_rows(json_obj['table'], false)
      alert("error");
    },
    success: function (json_data) {
      if(json_data['result']=='success'){
        list_updates.push(json_obj);
        json_obj_config['update'] = list_updates;
        sessionStorage.setItem('config', JSON.stringify(json_obj_config));
      }
      if(json_data['result']=='failed'){
        load_rows(json_obj['table'], false)
        alert("cannot update row\n "+json_data['error'])
      }
    },
  });
}
function reset(){
  json_obj_config = JSON.parse(sessionStorage.getItem('config'));
  delete json_obj_config['remove']
  delete json_obj_config['update']
  sessionStorage.setItem("config", JSON.stringify(json_obj_config))
  load_rows($("#select_table option:selected").val(), false)
}

function init() {
  $("#search").trigger( "focus" );
  let json_obj_config = JSON.parse(sessionStorage.getItem("config"));
  if (json_obj_config["template"] !== undefined) {
      $("#transfer").removeClass("selected");
      $("#template").addClass("selected");
      $("h1").text("Database template");
      if(json_obj_config["user_settings"]["theme"]==='color')
        $(".header").css("background-color", "rgb(96, 42, 121)");
  }
  load_tables();
  $("#select_table").change(function (e) {
    load_rows($("#select_table option:selected").val(), true)
    e.preventDefault();
  });
  $("#select_column").change(function (e) {
    load_rows($("#select_table option:selected").val(), false)
    e.preventDefault();
  });
  $('.saveEdit').on('click', function () {
    let id = $(this).data('id');
    saveNote(id);
    $('#saveEditModal').modal('toggle');
  });
  $('.deleteEdit').on('click', function () {
    $('#saveEditModal').modal('toggle');
    let id = $(this).data('id');
    let table = String($("#select_table option:selected").val());
    remove_row(id, table);
  });
  var timeout = null;
  $('#search').on('input', function () {
      if (timeout !== null) {
          clearTimeout(timeout);
      }
      timeout = setTimeout(function () {
        let table = String($("#select_table option:selected").val());
        load_rows(table, false);
      }, 300);
  });
}

