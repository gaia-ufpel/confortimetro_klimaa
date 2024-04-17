
var div_config_diagnostics = null;
var diagnostics_current_action = 'ping';

get_html('config_diagnostics');

function diagnostics_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_diagnostics == null) {
        div_config_diagnostics = $('#config_diagnostics_html').html();
        $('#config_diagnostics_html').remove();
    }
}

function diagnostics_cancel(event) {
    event.stopPropagation();
    tags_configurar_close( 'diagnostics');
}

function diagnostics_show( ){
    console.log("entrou atcno_config_show para  ");
    diagnostics_prepare_html();
    tags_configurar_show( 'diagnostics', div_config_diagnostics);
    if ( ! special_configs['systemlog_feature_available']) {
        $('#diagnostics_selection option[value="logread"]').remove();
    }
    if ( ! special_configs['network_trafic_feature_available']) {
        $('#diagnostics_selection option[value="tcpdump"]').remove();
    }
    if ( ! special_configs['ipsec_feature_available']) {
        $('#diagnostics_selection option[value="ipsec"]').remove();
    }
    if ( ! special_configs['ovpn_feature_available']) {
        $('#diagnostics_selection option[value="openvpn"]').remove();
    }
    
    diagnostics_set_view();
}

function diagnostics_get_logread() {
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'get_logread'
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_get_debugpackread() {
    $('#div_fwupdate_result').empty();
    var aux = {
        "cmd":"conversor_config",
        "parms":{
            "command": "firmwareupdate",
            "data": "get_debug_pack"
        }
     };
     __diagnostics_send( aux);
}

function diagnostics_get_openvpn() {
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'get_openvpn_log'
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_change_loglevel_ipsec() {
    $('#div_diagnostics_result').empty();
    var level = $('#diagnostics_loglevel_ipsec').children("option:selected").val();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'ipsec',
            "cmd": 'loglevel',
            "level": level
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_getlog_ipsec() {
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'ipsec',
            "cmd": 'getlog'
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_start_ipsec() {
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'ipsec',
            "cmd": 'start'
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_stop_ipsec() {
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'ipsec',
            "cmd": 'stop'
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_statusall_ipsec() {
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'ipsec',
            "cmd": 'statusall'
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_start_logread() {
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'start_logread'
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_start_tcpdump() {
    var interface = $('#diagnostics_tcpdump_interface').children("option:selected").val();
    var mode = $('#diagnostics_tcpdump_fileformat').children("option:selected").val();
    var period = $('#diagnostics_tcpdump_time').children("option:selected").val();
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'start_tcpdump',
            "interface": interface,
            "mode":mode,
            "period":period
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_get_tcpdump() {
    $('#div_diagnostics_result').empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'get_tcpdump'
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_send() {
    $('#div_diagnostics_result').empty();
    var diagnostics = $('#diagnostics_command').val();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": diagnostics_current_action,
            "destination": diagnostics
        }
    };
    __diagnostics_send( aux);
}

function diagnostics_set_view() {
    var sel = $('#diagnostics_selection').children("option:selected").val();
    console.log("diagnostics_set_view " + sel);
    $('#div_diagnostics_result').empty();
    $('#div_diagnostic_tcpdump').hide();
    $('#div_diagnostic_logread').hide();
    $('#div_diagnostic_debugpackread').hide();
    $('#div_diagnostic_openvpn').hide();
    $('#div_diagnostic_ipsec').hide();
    $('#div_diagnostic_ping_dns').hide();
    if ( sel == 'ping' ) {
        diagnostics_current_action = 'ping';
        $('#diagnostic_ping_dns_title').text( lang.t('PING test '));
        $('#div_diagnostic_ping_dns').show();
    } else if ( sel == 'DNS') {
        diagnostics_current_action = 'nslookup';
        $('#diagnostic_ping_dns_title').text( lang.t('DNS test'));
        $('#div_diagnostic_ping_dns').show();
    } else if ( sel == 'logread') {
        diagnostics_current_action = 'logread';
        $('#div_diagnostic_logread').show();
    } else if ( sel == 'debugpackread') {
        diagnostics_current_action = 'debugpackread';
        $('#div_diagnostic_debugpackread').show();
    } else if ( sel == 'openvpn') {
        diagnostics_current_action = 'get_openvpn_log';
        $('#div_diagnostic_openvpn').show();
    } else if ( sel == 'ipsec') {
        diagnostics_current_action = 'ipsec';
        $('#div_diagnostic_ipsec').show();
    } else if ( sel == 'tcpdump') {
        diagnostics_current_action = 'tcpdump';
        $('#div_diagnostic_tcpdump').show();
        var urlpcap = '';
        if ( target_config.host_ip_device != null && target_config.host_ip_device.length > 0) {
            urlpcap = 'http://' + target_config.host_ip_device;
        }
        urlpcap += '/tcpdump_';
        $('#diagnostic_tcpdump_binary_download_cel').prop('href', urlpcap + 'cel.pcap');
        $('#diagnostic_tcpdump_binary_download_eth').prop('href', urlpcap + 'eth.pcap');
        $('#diagnostic_tcpdump_text_download_cel').prop('href', urlpcap + 'cel.txt');
        $('#diagnostic_tcpdump_text_download_eth').prop('href', urlpcap + 'eth.txt');
    }
}

