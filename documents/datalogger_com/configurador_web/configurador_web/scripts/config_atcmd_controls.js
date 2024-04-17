
var div_config_atcmd = null;

get_html('config_atcmd');

function atcmd_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_atcmd == null) {
        div_config_atcmd = $('#config_atcmd_html').html();
        $('#config_atcmd_html').remove();
    }
}

function atcmd_cancel(event) {
    event.stopPropagation();
    tags_configurar_close( 'atcmd');
}

function atcmd_config_show(){
    atcmd_prepare_html();
    console.log("entrou atcno_config_show");
    tags_configurar_show( 'atcmd', div_config_atcmd);
}

function atcmd_send() {
    $('#div_atcmd_result').empty();
    var atcmd = $('#atcmd_command').val();
    var url_2_use = "/cgi-bin/conversor_server_config.pyc"
    var dados_2_send = '{"cmd": "cel_modem","parms": { "command": "at_command", "data": "' + atcmd + '" } }';
    var func_success = function(data) {
        $( "#div_atcmd_result" ).empty().append( "<h2>Resultado:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    var func_error = function(data) {
        $( "#div_atcmd_result" ).empty().append( "<h2>Erro:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    __call_backend( url_2_use, dados_2_send, func_success, func_error);
}