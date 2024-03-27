var div_config_status = null;
var status_refresh_next_call = null;

if (typeof is_index_page === 'undefined') {
    get_html('config_status');
}

function get_html_and_show_status() {
    // para ser usada pelo index.html
    get_html('config_status', refresh_status);
}

function status_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_status == null) {
        console.log("PEgando local o heml de status");
        div_config_status = $('#config_status_html').html();
        $('#config_status_html').remove();
    }
}

function status_cancel(event) {
    if ( event != null) {
        event.stopPropagation();
    }
    tags_configurar_close( 'status');
}

function status_config_show(){
    console.log("entrou status_config_show para  ");
    status_prepare_html();
    tags_configurar_show( 'status', div_config_status);
}

function status_get_fail(xhr, ajaxOptions, thrownError) {
    // Aqui remontamos o menu conforme o status que foi recebido - tem a ver com ter ou nao modem e o que mais esta instalado no modem.
    status_current = null;
    process_specials_by_status();
    menu_set_view();
    status_cancel();
    var mesg = '<pre>';
    var mesg = lang.t('Problem reading status from equipment. Check the IP or hostname, network connection, and try again.\n\n');
    if ( xhr != null) {
        mesg += JSON.stringify(xhr, null, 4) + '\n';
    }
    if ( ajaxOptions != null) {
        mesg += JSON.stringify(ajaxOptions, null, 4) + '\n';
    }
    if ( thrownError != null) {
        mesg += JSON.stringify(thrownError, null, 4) + '\n';
    }
    mesg += '</pre>';
    $('#load_fail_get_status').empty().append(mesg).show();
    console.log("status_get_fail " + mesg);
}

function status_get_sucess(data) {
    // Aqui remontamos o menu conforme o status que foi recebido - tem a ver com ter ou nao modem e o que mais esta instalado no modem.
    status_current = data;
    process_specials_by_status();
    menu_set_view();
    // agora fazemos a apresentacao
    status_config_show();
    $( "#status_raw" ).val( JSON.stringify(data, null, 4));
    var stmessage = '<pre>';
    var staux = 'result_code';
    var ses = {};
    if ( staux in data && data[staux] == 200) {
        var dados = data['data'];

        staux = 'credentials';
        ses = dados[staux];
        stmessage += lang.t("Firmware = ") + ses['release_name'] + '-' + ses['part_number'] + '-' + ses['version'] + "-" + ses['release_date'] + "\n";
        stmessage += lang.t('Modem ID: ') + ses['serial_number'] + "\n";
        stmessage += lang.t('Time in seconds since poweron: ') + dados['uptime'] + "\n";
        stmessage += "\n";

        if ( special_configs['celmodem_available']) {
            staux = 'cel_modem';
            ses = dados[staux];
            staux = 'abs_enabled';
            stmessage += lang.t("Cellular Modem: ");
            if ( ses[staux]  == 0) {
                stmessage += lang.t("disabled") + ".\n";
            } else {
                stmessage += lang.t("enabled") + ". ";
                stmessage += lang.t("Signal") + ": " + ses['SINAL'] + ". ";
                stmessage += lang.t("APN") + ": " + ses['apn'] + ". ";
                if ( ses['reason'] == 'ALL_SET') {
                    stmessage += lang.t("CONNECTED") + ". ";
                } else {
                    stmessage += lang.t(ses['reason']) + ". ";
                }
                stmessage += "\n";
                stmessage += '    IMSI: ' + ses["IMSI"];
            }
            stmessage += "\n";
        }

        staux = 'network';
        
        if ( special_configs['celmodem_available']) {
            ses = dados[staux]['wanCel'];
            if ( ses['state'] == 'up') {
                var sta = 'ip_address';
                if ( sta in ses) {
                    stmessage += '    IP: ' + ses[sta];
                }
                var sta = 'ipv6_address';
                if ( sta in ses) {
                    stmessage += '    IPv6: ' + ses[sta];
                }
            }
        }
        stmessage += "\n";

        stmessage += "\n";
        ses = dados[staux]['eth_cable'];
        stmessage += lang.t('Ethernet cable ');
        if ( ses['conected']) {
            stmessage += lang.t('connected as ') + ses['config'];
        } else {
            stmessage += lang.t('disconnected');
        }
        stmessage += "\n";
        ses = dados[staux]['wan'];
        if ( ses['state'] == 'up') {
            var sta = 'ip_address';
            if ( sta in ses) {
                stmessage += '    IP: ' + ses[sta];
            }
            var sta = 'ipv6_address';
            if ( sta in ses) {
                stmessage += '    IPv6: ' + ses[sta];
            }
        }
        stmessage += "\n";

        stmessage += "\n";
        staux = 'conversor';
        ses = dados[staux]['serial_publica'];
        stmessage += lang.t("Serial: ") + ses['baudrate'] + ',' + ses['cs'] + ',' + ses['par'] + ',' + ses['stopbit'] + "\n";
        stmessage += lang.t("    Totals: Rx ") + ses['rx_total'] + lang.t('. Tx: ') + ses['tx_total'] + "\n";
        stmessage += "\n";

        var obkey = Object.keys(dados[staux]);
        for ( var idx in obkey) {
            ses = dados[staux][obkey[idx]];
            if ( ses['tipo'] == 'tcp_client') {
                stmessage += lang.t("TCP: client");
            } else if ( ses['tipo'] == 'tcp_server') {
                stmessage += lang.t("TCP: server");
            } else {
                continue;
            }
            stmessage += "  " + ses['name'] + "  "
            if ( ses['connected']) {
                var tempodeconexao = Math.round(dados['uptime'] - ses['connection_start']);
                //console.log("Tempo de conexao calculado " + tempodeconexao + " uptime " + dados['uptime'] + "  conectado em " + ses['connection_start']);
                stmessage += lang.t("Time in seconds since connection ") + tempodeconexao;
            } else {
                stmessage += lang.t("Disconnected. ") + lang.t(ses['fail_reason']);
            }
            stmessage += "\n";
            stmessage += ses['count_attempts'] + lang.t(' connection attempts. ');
            stmessage += ses['connection_count'] + lang.t(' successful connections.');
            stmessage += "\n";
            stmessage += lang.t("    Totals: Rx ") + ses['rx_total'] + lang.t('. Tx: ') + ses['tx_total'] + "\n";
            stmessage += "\n";
        }
    }

    stmessage += '</pre>';
    console.log("Vai colocar o status na div " + stmessage);
    $("#div_status_result").empty().append(stmessage).show();
    if (status_refresh_next_call)       status_refresh_next_call();
}

function get_current_status( next_call) {
    status_refresh_next_call = next_call;   
    var url_2_use = "/cgi-bin/conversor_server_config.pyc"
    var dados_2_send = '{   "cmd": "get_conversor_status",     "parms": {} }';
    console.log("refresh_status vai chamar o BE ");
    __call_backend( url_2_use, dados_2_send, status_get_sucess, status_get_fail);
}

function refresh_status( e) {
    if ( e !== null) {
        e.preventDefault();
    }
    get_current_status( null);
}

function status_refresh() {
    refresh_status(null);
}