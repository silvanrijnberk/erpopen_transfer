$(window).load(function () {
    sessionStorage.removeItem('config')
    sessionStorage.removeItem('companies')
    sessionStorage.removeItem('templates')
    sessionStorage.removeItem('users')
    sessionStorage.removeItem('transfers')
    json_obj_config = {};
    $.ajax({
        type: "POST",
        url: "/user",
        data: JSON.stringify(json_obj_config),
        contentType: 'application/json',
        dataType: 'json',
        error: function () {
            sessionStorage.removeItem('config')
            sessionStorage.removeItem('companies')
            sessionStorage.removeItem('templates')
            sessionStorage.removeItem('users')
            sessionStorage.removeItem('transfers')
            console.log('fail');
        },
        success: function () {
          window.location.href="/ ";
        },
    });
});