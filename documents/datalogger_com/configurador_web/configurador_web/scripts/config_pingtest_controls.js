
var div_config_pingtest = null;
var pingtest_current_action = 'ping';

get_html('config_pingtest');

function pingtest_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_pingtest == null) {
        div_config_pingtest = $('#config_pingtest_html').html();
        $('#config_pingtest_html').remove();
    }
}

function pingtest_cancel(event) {
    event.stopPropagation();
    tags_configurar_close( 'pingtest');
}

function pingtest_show( acao){
    console.log("entrou atcno_config_show para  " + acao);
    pingtest_prepare_html();
    pingtest_current_action = acao
    tags_configurar_show( 'pingtest', div_config_pingtest);
}

function pingtest_send() {
    $('#div_pingtest_result').empty();
    var pingtest = $('#pingtest_command').val();
    var url_2_use = "/cgi-bin/conversor_server_config.pyc"
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": pingtest_current_action,
            "destination": pingtest
        }
    };
    var dados_2_send = JSON.stringify(aux);
    var func_success = function(data) {
        var result = '';
        if ( data != null && 'data' in data && 'result' in data['data']) {
            result = data['data']['result'];
        }
        $( "#div_pingtest_result" ).empty().append( "<h2>Resultado:</h2> <pre>" + result + "\n" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    var func_error = function(data) {
        $( "#div_pingtest_result" ).empty().append( "<h2>Erro:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    __call_backend( url_2_use, dados_2_send, func_success, func_error);
}