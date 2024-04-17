
var div_config_pinunlock = null;

get_html('config_pinunlock');

function pinunlock_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_pinunlock == null) {
        div_config_pinunlock = $('#config_pinunlock_html').html();
        $('#config_pinunlock_html').remove();
    }
}

function pinunlock_cancel(event) {
    event.stopPropagation();
    tags_configurar_close( 'pinunlock');
}

function pinunlock_config_show(){
    console.log("entrou atcno_config_show");
    pinunlock_prepare_html();
    tags_configurar_show( 'pinunlock', div_config_pinunlock);
}

function pinunlock_send() {
    $('#div_pinunlock_result').empty();
    var pinunlock = $('#pinunlock_pin').val();
    var url_2_use = "/cgi-bin/conversor_server_config.pyc";
    var aux = {
        "cmd": "cel_modem",
        "parms": { 
            "command": "at_command",
            "data": 'AT+CLCK="SC",0,"' + pinunlock + '"'
        }
    };
    var dados_2_send = JSON.stringify(aux);
    var func_success = function(data) {
        $( "#div_pinunlock_result" ).empty().append( "<h2>Resultado:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    var func_error = function(data) {
        $( "#div_pinunlock_result" ).empty().append( "<h2>Erro:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    __call_backend( url_2_use, dados_2_send, func_success, func_error);
}