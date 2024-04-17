
var div_config_ipconfig = null;

get_html('config_ipconfig');

function ipconfig_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_ipconfig == null) {
        div_config_ipconfig = $('#config_ipconfig_html').html();
        $('#config_ipconfig_html').remove();
    }
}

function ipconfig_set_view() {
}

function ipconfig_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'ipconfig');
}

function ipconfig_config_show() {
    console.log("entrou ipconfig_config_show");
    block_other_acctions();
    ipconfig_prepare_html();
    var already_open = tags_configurar_show( 'ipconfig', div_config_ipconfig);
    if ( ! already_open) {
        ipconfig_set_view();
    }
}

function ipconfig_edit_confirm( event) {
    event.stopPropagation();
    free_other_acctions();

    var faz = confirm(lang.t("WARNING: \n\nThis command probably change the access IP that is in use. And need a reboot to get valid"));
    if ( faz ) {
        dados_obj = {
            "cmd":"conversor_config",
            "parms":{
                "command": "ip_config_change",
                "data": {
                    "ipaddr" : $('#ipconfig_ip_fixo').val()
                }
            }
        }
        var div_target = 'div_ipconfig_resultado';
        $('#' + div_target).empty();
        var url_2_use = "/cgi-bin/conversor_server_config.pyc"
        var dados_2_send = JSON.stringify(dados_obj);
        var func_success = function(data) {
            var result = '';
            if ( data != null && 'data' in data && 'result' in data['data']) {
                result = data['data']['result'];
            }
            $( "#" + div_target).empty().append( "<h2>Change has been done:</h2>Pleas reboot the equipment. And remeber to use this new IP to access the configuration.");
        };
        var func_error = function(data) {
            $( "#" + div_target).empty().append( "<h2>Erro:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
        };
        __call_backend( url_2_use, dados_2_send, func_success, func_error);
    }
}