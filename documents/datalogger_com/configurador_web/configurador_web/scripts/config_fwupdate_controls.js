
var div_config_fwupdate = null;

get_html('config_fwupdate');

function fwupdate_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_fwupdate == null) {
        div_config_fwupdate = $('#config_fwupdate_html').html();
        $('#config_fwupdate_html').remove();
    }
}

function fwupdate_cancel(event) {
    event.stopPropagation();
    tags_configurar_close( 'fwupdate');
}

function fwupdate_show(){
    console.log("entrou atcno_config_show");
    fwupdate_prepare_html();
    tags_configurar_show( 'fwupdate', div_config_fwupdate);
}

function fwupdate_send( dados_2_send) {
    $('#div_fwupdate_result').empty();
    var url_2_use = "/cgi-bin/conversor_server_config.pyc"
    var func_success = function(data) {
        var result = '';
        if ( 'data' in data && 'result' in data['data']) {
            result = data['data']['result'];
        }
        $( "#div_fwupdate_result" ).empty().append( "<h2>Resultado:</h2> <pre>" + result + "</pre>" );
    };
    var func_error = function(data) {
        var result = '';
        if ( 'data' in data && 'result' in data['data']) {
            result = data['data']['result'] + '\n\n';
        }
        $( "#div_fwupdate_result" ).empty().append( "<h2>Erro:</h2> <pre>" + result + JSON.stringify(data, null, 4) + "</pre>" );
    };
    __call_backend( url_2_use, dados_2_send, func_success, func_error);
}

function fwupdate_download( ) {
    $('#div_fwupdate_result').empty();
    var urlpack = $('#fwupdate_url').val();
    var tmo = $('#fwupdate_tmo').val();
    if (tmo < 30) {
        tmo = 30;
    }
    var aux = {
        "cmd":"conversor_config",
        "parms":{
            "command": "firmwareupdate",
            "data": "download",
            "timeout" :  tmo
        }
     };
     if ( urlpack.length > 1){
         aux['parms']['url'] = urlpack;
     }
    var dados_2_send = JSON.stringify(aux);
    fwupdate_send( dados_2_send);
}

function fwupdate_update() {
    $('#div_fwupdate_result').empty();
    var urlpack = $('#fwupdate_url').val();
    var tmo = $('#fwupdate_tmo').val();
    var aux = {
        "cmd":"conversor_config",
        "parms":{
            "command": "firmwareupdate",
            "data": "update"
        }
     };
    var dados_2_send = JSON.stringify(aux);
    fwupdate_send( dados_2_send);
}

function fwupdate_getlog() {
    $('#div_fwupdate_result').empty();
    var urlpack = $('#fwupdate_url').val();
    var tmo = $('#fwupdate_tmo').val();
    var aux = {
        "cmd":"conversor_config",
        "parms":{
            "command": "firmwareupdate",
            "data": "get_log"
        }
     };
    var dados_2_send = JSON.stringify(aux);
    fwupdate_send( dados_2_send);
}
