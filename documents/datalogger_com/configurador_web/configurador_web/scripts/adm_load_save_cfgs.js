        
var status_current = {};
var config_current = {};
var current_config_loaded = false;
var config_current_slices = {};
var config_to_save = {};
var config_save_pending = false;
var configs_changed = {};
var configs_last_update = null;

function config_has_been_changed(name) {
    configs_changed[name] = Date.now();
}

function is_config_changed(name, show_full) {
    if (show_full)        return true;
    if (name in configs_changed && configs_changed[name] > configs_last_update) {
        return true;
    }
    return false;
}

// quando rele a configuracao corrente do equipamento e dai reorganiza as variaveis locais de configuracao
function current_config_renew() {
    console.log("Entrou na current_config_renew");
    config_save_pending = false;
    hide_config_save_pending();
    build_config_to_save_from_current();
    configs_last_update = Date.now();
}

function config_send_fail(xhr, ajaxOptions, thrownError) {
    // Aqui remontamos o menu conforme o status que foi recebido - tem a ver com ter ou nao modem e o que mais esta instalado no modem.
    var mesg = '<pre>' + lang.t('Problem sending new configuration to equipment. Check the IP or hostname, network connection, and try again.\n\n');
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
    $('#load_result').empty().append(mesg).show();
}

function config_get_fail(xhr, ajaxOptions, thrownError) {
    // Aqui remontamos o menu conforme o status que foi recebido - tem a ver com ter ou nao modem e o que mais esta instalado no modem.
    console.log('Falha na call para o servidor. xhr' + JSON.stringify(xhr, null, 4));
    current_config_loaded = false;
    var mesg = '';
    mesg = '<pre>' + lang.t('Problem reading current configuration from equipment.\n\n');
    if ( xhr != null) {
        if (xhr.status == 0) {
            // Cpnnection refused
            if ( target_config.type == 'modem') {
                mesg = '<pre>' + lang.t('Check the IP or hostname, network connection, and try again.\n\n');
            } else {
                mesg = '<pre>' + lang.t('Check if Configuration Server is running and try again.\n\n');
            }
        } else {
            if ( target_config.type == 'modem') {
                mesg = '<pre>' + lang.t('Check the IP or hostname, network connection, and try again.\n\n');
            } else if ( target_config.type == 'absgateway') {
                mesg = '<pre>' + lang.t('Check IP, hostname and Port to Gateway and try again.\n\n');
            } else {
                mesg = '<pre>' + lang.t('Check serial connection and try again.\n\n');
            }
        }
        mesg += JSON.stringify(xhr, null, 4) + '\n';
    }
    if ( ajaxOptions != null) {
        mesg += JSON.stringify(ajaxOptions, null, 4) + '\n';
    }
    if ( thrownError != null) {
        mesg += JSON.stringify(thrownError, null, 4) + '\n';
    }
    mesg += '</pre>';
    $('#load_result').empty().append(mesg).show();
}

function get_current_status_config(e){
    if ( e !== null) {
        e.preventDefault();
    }
    hide_status_message();
    hide_configurar();
    menu_hide();
    get_current_status(get_current_config);
}

function get_current_config() {
    console.log("Entrou na  get_current_config ");
    var url_2_use = "/cgi-bin/conversor_server_config.pyc"
    var dados_2_send = '{   "cmd": "get_conversor_config",     "parms": {} }';
    __call_backend( url_2_use, dados_2_send, function( data) {
        var rescode = -1;
        if ('result_code' in data) {
            rescode = data['result_code'];
        }
        if (rescode >= 200 && rescode < 300) {
            config_current = data;
            current_config_loaded = true;
            current_config_renew();
            var datatoshow = null;
            if ( special_configs['load_raw_config_to_editor']) {
                if ( 'data' in data) {
                    datatoshow = {
                        "cmd": "set_conversor_config",
                        "parms": data['data']
                    }
                } else {
                    datatoshow = data;
                }
            }
            set_on_finnal_config_editor( datatoshow);
            menu_show();
        } else {
            var mesg = '';
            mesg = '<pre>' + lang.t('Problem reading current configuration from equipment.\n\n');
            mesg += JSON.stringify(data, null, 4) + '\n';
            mesg += '</pre>';
            $('#load_result').empty().append(mesg).show();
        }
    }, config_get_fail);
}

function configurar (event, keep_show) {
    // pegar o conteudo do editor para fazer o envio
    var cod = editor_finnal_config.getValue("");
    console.log("Codigo a enviar " + cod);
    try {
        jcod = JSON.parse( cod);
        var url_2_use = "/cgi-bin/conversor_server_config.pyc"
        var dados_2_send = JSON.stringify(jcod);
        hide_status_message();
        if ( ! keep_show) {
            hide_configurar();
        }
        __call_backend( url_2_use, dados_2_send, function( data) {
            var result_msg = "";
            var excecution_msg = "";
            if ( "result_mesg" in data ) {
                result_msg = data["result_mesg"];
            }
            if ( "data" in data) {
                if ("firewall_restart" in data["data"]) {
                    excecution_msg = data["data"]["firewall_restart"];
                } else if ("userapp_install" in data["data"]) {
                    excecution_msg = data["data"]["userapp_install"];
                }
            }
            $( "#load_result" ).empty().append( "<h2>"+ lang.t("Result:") + "</h2><pre>" + result_msg + "</br></br>" + excecution_msg + "</br>" + JSON.stringify(data, null, 4) + "\n" + "</pre> </br> " ).show();
            // Como a configuracao foi salva corretamente tira a mensagem de configuracao pendente
            config_save_pending = false;
            configs_last_update = Date.now();
            if ( ! keep_show) {
                hide_config_save_pending();
            }
        }, config_send_fail);
    } catch (e) {
        $( "#load_result" ).empty().append( "<h2>" + lang.t("Fail: ") + JSON.stringify(e, null, 4) + ".</h2>" ).show();
    }
}

function set_conversor_config_show_changes_on_page() {
    tcp_config_to_finnal_format();
    set_on_finnal_config_editor(null);
    show_config_save_pending();
}

function build_set_conversor_config_2_send(show_full) {
    console.log(" Entrou na build_set_conversor_config_2_send");
    //var set_conversor_config = JSON.parse('{"cmd": "set_conversor_config", "parms": { "network": {}, "conversor": { "worker":{}}}}');
    var set_conversor_config = JSON.parse('{"cmd": "set_conversor_config", "parms": { }}');
    var staux = "";
    var staux1 = "";
    var stparms = "parms"
    // pega os dados da config_to_save
    staux = "network";
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    if (special_configs['eth_usb_feature_available']) {
        staux = "network2";
        if ( staux in config_to_save && is_config_changed(staux, show_full)) {
            set_conversor_config[stparms][staux] = config_to_save[staux];
        }
    }
    staux = strouter;
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = stovpn;
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = stwebsec;
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = "userapp";
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    if (is_config_changed("ddns", show_full) || is_config_changed("cel_modem", show_full)) {
        staux = "cel_modem";
        if ( staux in config_to_save) {
            set_conversor_config[stparms][staux] = config_to_save[staux];
        }
        staux = "ddns";
        if ( staux in config_to_save && is_config_changed(staux, show_full)) {
            staux1 = "cel_modem";
            if ( ! staux1 in set_conversor_config[stparms]) {
                set_conversor_config[stparms][staux1] = {};
            }
            set_conversor_config[stparms][staux1][staux] = config_to_save[staux];
        }
    }
    staux = "ip_forwarding";
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = "scheduled_reboot";
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = stdhcp;
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = "DMZ";
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = "static_routes";
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = "ipsec";
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    staux = "wd_active_connection";
    if ( staux in config_to_save && is_config_changed(staux, show_full)) {
        set_conversor_config[stparms][staux] = config_to_save[staux];
    }
    if (   is_config_changed("ftp", show_full)        || is_config_changed("http", show_full) 
        || is_config_changed("serial_abs", show_full) || is_config_changed("serial_publica", show_full)
        || is_config_changed("tcp_all", show_full))
    {
        if ( ! (stconversor in set_conversor_config[stparms]))                    set_conversor_config[stparms][stconversor] = {};
        if ( ! (stworker    in set_conversor_config[stparms][stconversor]))       set_conversor_config[stparms][stconversor][stworker] = {};
        staux = "ftp";
        if ( staux in config_to_save) {
            set_conversor_config[stparms][stconversor][stworker][staux] = config_to_save[staux];
        }
        staux = "http";
        if ( staux in config_to_save) {
            set_conversor_config[stparms][stconversor][stworker][staux] = config_to_save[staux];
        }
        staux = "serial_abs";
        if ( staux in config_to_save) {
            set_conversor_config[stparms][stconversor][stworker][staux] = config_to_save[staux];
        }
        staux = "serial_publica";
        if ( staux in config_to_save) {
            set_conversor_config[stparms][stconversor][stworker][staux] = config_to_save[staux];
        }
        staux = "tcp_all";
        if ( staux in config_to_save) {
            // todas as configuracoes dos tcp server e tcp client estarao neste objeto
            // temos que percorrer um a um e passar para o conversor
            for ( key in config_to_save[staux]) {
                set_conversor_config[stparms][stconversor][stworker][key] = config_to_save[staux][key];
            }
        }
    }
    return set_conversor_config;
}

function get_comport_available( e) {
    console.log("Entrou na  get_comport_available ");

    show_waiting();
    var url_2_use = "/serial_port_available"
    var url = "http://" + 'localhost:4321' + url_2_use;
    var dados_2_send = '{}';
    var func_ok = function( data) {
        console.log('Leu as COM ports disponiveis' + JSON.stringify(data, null, 4));
        target_config.comport_availabel = data;
        for ( var idx in data) {
            var st = '<option  class="trl" value="' + data[idx] + '">' + data[idx] + '</option>'
            $('#comport_2_use').append( st);
        }
        // e aqui adicionar as opcoes de conexao
        var st = '<option class="trl" value="absgateway">Remote</option> <option class="trl" value="serial">Serial port</option>'
        $('#config_target_type').append( st);
        hide_waiting();
    };
    var func_er = function config_send_fail(xhr, ajaxOptions, thrownError) {
        // Aqui remontamos o menu conforme o status que foi recebido - tem a ver com ter ou nao modem e o que mais esta instalado no modem.
        var mesg = '';
        if ( xhr != null) {
            mesg += JSON.stringify(xhr, null, 4) + '\n';
        }
        if ( ajaxOptions != null) {
            mesg += JSON.stringify(ajaxOptions, null, 4) + '\n';
        }
        if ( thrownError != null) {
            mesg += JSON.stringify(thrownError, null, 4) + '\n';
        }
        hide_waiting();
        console.log('Erro na tentativa de ler as COM ports disponiveis' + mesg);
    }
    $.ajax({
        dataType: "json",
        contentType: 'application/json',
        type: 'POST',
        url: url,
        timeout: 180000, // sets timeout to 180 seconds
        crossDomain: true,
        data: dados_2_send,
        success: func_ok,
        error: func_er,
    });
    
}

function __diagnostics_send( dados_obj, div_target = 'div_diagnostics_result', proc_func = null) {
    $('#' + div_target).empty();
    var url_2_use = "/cgi-bin/conversor_server_config.pyc"
    var dados_2_send = JSON.stringify(dados_obj);
    var func_success = function(data) {
        var result = '';
        if ( data != null && 'data' in data && 'result' in data['data']) {
            if (proc_func == null) {
                console.log("Recebeu retorno e nao tem funcao de tratamento");
                result = data['data']['result']  + "\n" + JSON.stringify(data, null, 4);
            } else {
                console.log("Recebeu retorno e TEM funcao de tratamento");
                result = proc_func(data['data']['result']);
            }
        }
        $( "#" + div_target ).empty().append( "<h2>Resultado:</h2> <pre>" + result + "</pre>" );
    };
    var func_error = function(data) {
        $( "#" + div_target ).empty().append( "<h2>Erro:</h2> <pre>" + JSON.stringify(data, null, 4) + "</pre>" );
    };
    __call_backend( url_2_use, dados_2_send, func_success, func_error);
}
