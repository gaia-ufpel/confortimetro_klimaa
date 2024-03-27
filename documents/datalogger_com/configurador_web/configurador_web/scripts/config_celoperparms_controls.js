
var div_config_celoperparms = null;

get_html('config_celoperparms');

function celoperparms_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_celoperparms == null) {
        div_config_celoperparms = $('#config_celoperparms_html').html();
        $('#config_celoperparms_html').remove();
    }
}

function celoperparms_cancel(event) {
    event.stopPropagation();
    tags_configurar_close( 'celoperparms');
}

function celoperparms_config_show( acao){
    console.log("entrou celoperparms_config_show para  " + acao);
    celoperparms_prepare_html();
    tags_configurar_show( 'celoperparms', div_config_celoperparms);
}

function celoperparms_read() {
    $('#div_celoperparms_result').empty();
    var url_2_use = "/cgi-bin/conversor_server_config.pyc"
    var aux = {
        "cmd": "cel_modem",
        "parms": { 
            "command": 'get_operator_parameters',
            "data": {}
        }
    };
    var dados_2_send = JSON.stringify(aux);
    var func_success = function(data) {
        var result = null;
        if ( data != null && 'data' in data && 'result' in data['data']) {
            result = data['data']['result'];
        }
        // $( "#div_celoperparms_result" ).empty().append( "<h2>Resultado:</h2> <pre>" + result + "\n" + JSON.stringify(data, null, 4) + "</pre>" );
        if ( result != null ) {
            $('#celoperparms_parameters').val(result);
        }
    };
    var func_error = function(data) {
        $( "#div_celoperparms_result" ).empty().append( "<h2>Erro:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    __call_backend( url_2_use, dados_2_send, func_success, func_error);
}

function celoperparms_send() {
    $('#div_celoperparms_result').empty();
    var celoperparms = $('#celoperparms_parameters').val();
    var url_2_use = "/cgi-bin/conversor_server_config.pyc"
    var aux = {
        "cmd": "cel_modem",
        "parms": { 
            "command": 'save_operator_parameters',
            "data": celoperparms
        }
    };
    var dados_2_send = JSON.stringify(aux);
    var func_success = function(data) {
        var result = '';
        if ( data != null && 'data' in data && 'result' in data['data']) {
            result = data['data']['result'];
        }
        $( "#div_celoperparms_result" ).empty().append( "<h2>Resultado:</h2> <pre>" + result + "\n" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    var func_error = function(data) {
        $( "#div_celoperparms_result" ).empty().append( "<h2>Erro:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    __call_backend( url_2_use, dados_2_send, func_success, func_error);
}
