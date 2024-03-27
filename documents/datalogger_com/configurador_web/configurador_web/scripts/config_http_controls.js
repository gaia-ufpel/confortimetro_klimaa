
var div_config_http = null;
var http_headers_contador = 0

get_html('config_http');

function http_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_http == null) {
        div_config_http = $('#config_http_html').html();
        $('#config_http_html').remove();
    }
}

function http_set_view() {
    // console.log("http_set_view " + $('#http_dhcp_conf').children("option:selected").val());
    if ($('#http_usemode_conf').children("option:selected").val() == 'off') {
        $( '#div_http_enabled').hide();
    } else {
        $( '#div_http_enabled').show();
    }
    if ($('#http_usemode_conf').children("option:selected").val() == 'always') {
        $( '#http_trigger_user').prop('disabled', true);
    } else {
        $( '#http_trigger_user').prop('disabled', false);
    }
    if (special_configs['http_trigger_post_available']) {
        $( '#div_http_trigger_post_enable').show();
    } else {
        $( '#div_http_trigger_post_enable').hide();
    }
}

function http_edit_cancel(event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'http');
}

function http_config_show() {
    console.log("entrou http_config_show");
    block_other_acctions();
    http_prepare_html();
    // limpar as divs que apresentam os dados
    var already_open = tags_configurar_show( 'http', div_config_http);
    if ( ! already_open) {
        if ( ! ( 'http' in config_to_save)) {
            config_to_save['http'] = {
                "tipo":"http",
                "usemode": "off",
                "trigger": "ABSMSGNS",
                "trigger_user": "httpsend",
                "protocol": "",
                "hostname": "",
                "hostport": "",
                "timeout": "60",
                "caminho": "",
                "station": "",
                "query_string": "",
                "metodo": "GET",
                "headers": [
                    "Content-Type: text/text"
                ],
                "encode_url": 0
            };
        }
        $('#http_usemode_conf').val(config_to_save['http']['usemode']);
        //   http://alex:1111@meu.com.br:90/dir/name?q1=4&q2=4
        var parms = {
            'protocol' : config_to_save['http']['protocol'],
            'host' : config_to_save['http']['hostname'],
            'port' : config_to_save['http']['hostport'],
            'path' : config_to_save['http']['caminho'],
            'userInfo' : config_to_save['http']['station'],
            'query' : config_to_save['http']['query_string'],
        };
        $('#http_url_config').val(buildUri( parms));
        $('#http_transfer_timeout').val(config_to_save['http']['timeout']);
        $('#http_trigger_user').val(config_to_save['http']['trigger_user']);
        $('#http_metodo_2_use').val(config_to_save['http']['metodo']);
        $('#http_url_encode').val(config_to_save['http']['encode_url']);
        http_headers_contador = 0
        if (config_to_save['http']['headers']) {
            http_headers_contador = config_to_save['http']['headers'].length;
        }
        if (http_headers_contador > 0) {
            for( var i = 0; i < http_headers_contador; i++) {
                __http_config_add_headers(i,config_to_save['http']['headers'][i]);
            }
        } else {
            __http_config_add_headers(0,"Content-Type: text/plain");
            http_headers_contador = 1
        }
        http_set_view();
    }
}

function __http_config_add_headers(idx, valor) {
    $("#http_mais_headers").append('<div id="div_http_headers_' + idx + '"></br><input id="http_header_' + idx + '" type="text" value="' + valor + '" class="form-control-sm">' +
    '<input id="http_header_' + idx + '_remove" onclick="http_config_del_headers_space(' + idx + ')" value="Remove" type="button"  class="btn btn-outline-primary btn-sm http_header_remove"/>')
}

function http_config_add_headers_space(event) {
    event.stopPropagation();
    http_headers_contador++;
    __http_config_add_headers(http_headers_contador, "")
}

function http_config_del_headers_space(idx) {
    console.log("Pressionou no remove um header ");
    console.log("Botao  " + idx);
    $('#' + 'div_http_headers_' + idx).remove();
}

function http_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( 'http' in config_to_save)) {
        config_to_save['http'] = {};
    }
    var urldividida = parseUri( $('#http_url_config').val());
    console.log("http url dividida " + JSON.stringify(urldividida, null, 4));

    // TODO - se existir o anchor temos que ver onde colocar
    //      tendo query deve ir depois dela com um # antes
    //      
    config_to_save['http']['tipo'] = 'http';
    config_to_save['http']['usemode'] = $('#http_usemode_conf').val();
    config_to_save['http']['protocol'] = urldividida['protocol'];
    config_to_save['http']['hostname'] = urldividida['host'];
    config_to_save['http']['hostport'] = urldividida['port'];
    config_to_save['http']['caminho'] = urldividida['relative'];
    config_to_save['http']['station'] = urldividida['userInfo'];
    config_to_save['http']['query_string'] = '';
    config_to_save['http']['trigger_user'] = $('#http_trigger_user').val();
    config_to_save['http']['metodo'] = $('#http_metodo_2_use').val();
    config_to_save['http']['encode_url'] = $('#http_url_encode').val();
    headers = []
    for(i = 0; i < http_headers_contador; i++) {
        var aux = $('#http_header_' + i).val()
        if (aux) {
            headers.push(aux)
        }
    }
    config_to_save['http']['headers'] = headers
    tags_configurar_close( 'http');
    config_has_been_changed('http')
    set_conversor_config_show_changes_on_page();
}