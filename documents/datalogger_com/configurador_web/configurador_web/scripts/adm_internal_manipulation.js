



// Desmonta a configuracao lida do modem em partes que permitam ser editadas.
function build_config_to_save_from_current() {
    var staux = "data";
    var dataaux = null;

    console.log("Entrou na build_config_to_save_from_current  com config_save_pending = " + config_save_pending);
    if ( staux in config_current) {
        dataaux = config_current[staux];
        {
            staux = "network";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_network( config_data, staux);
        }
        {
            staux = "network2";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_network( config_data, staux);
        }
        {
            staux = "cel_modem";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_cel_modem( config_data);
        }
        {
            staux = "ip_forwarding";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_ip_forwarding( config_data);
        }
        {
            staux = "static_routes";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_static_routes( config_data);
        }
        {
            staux = strouter;
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_router( config_data);
        }
        {
            staux = stdhcp;
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_dhcp( config_data);
        }
        {
            staux = "DMZ";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_dmz( config_data);
        }
        {
            staux = "scheduled_reboot";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_scheduled_reboot(config_data);
        }
        {
            staux = stovpn;
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_ovpn( config_data);
        }
        {
            staux = stipsec;
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_ipsec( config_data);
        }
        {
            staux = "wd_active_connection";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_active_wd( config_data);
        }
        {
            staux = stwebsec;
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_websec( config_data);
        }
        {
            staux = "userapp";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_userapp( config_data);
        }
        {
            staux = "conversor";
            var config_data = null;
            if ( staux in dataaux) {
                console.log("Encontrou " + staux);
                config_data = dataaux[staux]
            }
            apply_conversor( config_data);
        }
        console.log("Encerrando a build_config_to_save_from_current  com config_save_pending = " + config_save_pending);
        // So passa a configuracao lida do equip se ainda nao tiver nada editado pelo usuario
        if ( config_save_pending == false) {
            console.log("Na build_config_to_save_from_current atualizou o config_to_save" + JSON.stringify(config_current_slices));
            config_to_save = JSON.parse( JSON.stringify(config_current_slices));
            //console.log(config_to_save);
        }
    }
}

function apply_network( data, qual) {
    // primeiro vamos salvar no config_session_from_user
    console.log("Entrou na apply_network")
    var staux = "proto";
    if ( data != null) {
        if ( ! ( staux in data)) {
            data = null;    // nao tem parametros obrigatorio, vai usar o default
        } else if ( data[staux] != 'dhcp' && data[staux] != 'static') {
            data = null;    // nao tem parametros obrigatorio, vai usar o default
        }
    }
    if ( data == null) {
        //  temos que aplciar um default porque nao veio dados para network
        data = {};
    }
    config_current_slices[qual] = data;
}

function apply_router( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['router_feature_available']) {
        console.log("Entrou na apply_router")
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if (special_configs['router_feature_on_link']) {
            if ( data == null) {
                data = {
                    "wan_wanCel" : "0",
                    "wanCel_wan" : "0",
                    "wlan_wanCel" : "0",
                    "wanCel_wlan" : "0",
                    "wlan_wan" : "0",
                    "wan_wlan" : "0",
                    "wan_ovpn" : "0",
                    "ovpn_wan" : "0"
                };
            }
        } else {
            // versao antiga
            if ( data == null) {
                data = {
                    "enabled" : "0",
                };
            }
            if ( ! ( stdhcpserver in data)) {
                data[stdhcpserver] = {
                    "enabled" : "0",
                    "start" : "100",
                    "limit": "150",
                    "leasetime" : "12h"
                }
            }
        }
        config_current_slices[strouter] = data;
    }
}

function apply_dhcp( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['router_feature_available']) {
        console.log("Entrou na apply_dhcp")
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if ( data == null) {
            data = {
                "static_leases": []
            };
        }
        if ( ! ( "service" in data)) {
            data["service"] = {}
        }
        if ( ! ( "wan" in data["service"])) {
            data["service"]["wan"] = {
                "modo":"disabled",
                "secure_lease":"0",
                "start" : "100",
                "limit": "150",
                "leasetime" : "12h",
                "netmask":"255.255.255.0",
                "DNS_pri":"",
                "DNS_sec":"",
                "gateway":"",
            }
        }
        config_current_slices[stdhcp] = data;
    }
}

function apply_dmz( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['dmz_config_feature_available']) {
        console.log("Entrou na apply_dmz")
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if ( data == null) {
            data = [
                {
                    'src':'wanCel',
                    'enabled':'0',
                    'dest_ip':''
                }
            ];
        }
        config_current_slices["DMZ"] = data;
    }
}

function apply_scheduled_reboot( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['scheduled_reboot_feature_available']) {
        console.log("Entrou na apply_scheduled_reboot")
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if ( data == null) {
            data = {
                "enabled":"0",
                "day":"0",
                "hour":0,
                "min":0
            };
        }
        config_current_slices['scheduled_reboot'] = data;
    }
}

function apply_ovpn( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['ovpn_feature_available']) {
        console.log("Entrou na apply_ovpn")
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if ( data == null) {
            data = {
                "enabled" : "0",
                "dns_from_vpn" : "0",
                "username" : "username",
                "password" : "password",
                "config" : "",
            };
        }
        config_current_slices[stovpn] = data;
    }
}

function apply_ipsec( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['ipsec_feature_available']) {
        console.log("Entrou na apply_ipsec")
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if ( data == null) {
            data = {
                "enabled" : "0",
                "ipsec.conf" : "",
                "ipsec.secrets" : "",
                "ipsec.d" : {},
            };
        }
        config_current_slices[stipsec] = data;
    }
}

function apply_active_wd( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['active_wd_available']) {
        console.log("Entrou na apply_active_wd")
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if ( data != null) {
            config_current_slices['wd_active_connection'] = data;
        }
    }
}

function apply_websec( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['websec_feature_available']) {
        console.log("Entrou na apply_websec" + JSON.stringify(data));
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if ( data == null) {
            data = {
                "force_authorize" : "0",
                "allow_http_on_wancel" : "0",
                "allow_http_on_lan" : "0",
                "allow_http_on_ovpn" : "0",
                "allow_http_on_ipsec" : "0",
                'allowed_ips': [],
                'allowed_ips_from_lan': [],
                'allowed_ips_from_ovpn': [],
                'allowed_ips_from_ipsec': [],
            };
            console.log("apply_websec nao recebeu dados " + JSON.stringify(data));
        }
        if ( false == special_configs['fw_multisrc_config_feature_available']){
            data['allow_http_on_lan'] = '1';
            data['allowed_ips_from_lan'] = ['0.0.0.0/0'];
        }
        console.log("Saiu da apply_websec" + JSON.stringify(data));
        config_current_slices[stwebsec] = data;
    }
}

function apply_userapp( data) {
    // primeiro vamos salvar no config_session_from_user
    if (special_configs['userapp_feature_available']) {
        console.log("Entrou na apply_userapp")
        // AQUI EH ONDE SE VERIFICA SE RECEBEU LIXO E ACERTA
        if ( data == null) {
            data = {
                "enabled": "0",
                "lock": "1",
                "pacote": "",
                "http": {
                    "enabled" : "0",
                    "port":"",
                    "allow_http_on_wancel" : "0",
                    "allow_http_on_lan" : "0",
                    "allow_http_on_ovpn" : "0",
                    "allow_http_on_ipsec" : "0",
                    'allowed_ips': [],
                    'allowed_ips_from_lan': [],
                    'allowed_ips_from_ovpn': [],
                    'allowed_ips_from_ipsec': [],
                }
            };
        }
        config_current_slices["userapp"] = data;
    }
}

function apply_cel_modem( data) {
    if (special_configs['celmodem_available']) {
        if ( data == null) {
            data = {};
        }
        var staux = "ddns";
        var ddns = {};
        if ( staux in data) {
            ddns = data[staux];
            delete data[staux];
        } else {
            ddns = {};
        }
        config_current_slices['cel_modem'] = data;
        config_current_slices['ddns'] = ddns;
        console.log('Saindo com o ddns ' + JSON.stringify(ddns));
    }
}

function apply_ip_forwarding( data) {
    if (special_configs['router_feature_available']) {
        if ( data == null || data.length < 1) {
            data = [];
        }
        config_current_slices['ip_forwarding'] = data;
    }
}

function apply_static_routes( data) {
    if (special_configs['static_routes_feature_available']) {
        if ( data == null || data.length < 1) {
            data = [];
        }
        config_current_slices['static_routes'] = data;
    }
}

function apply_conversor( data) {
    var workers = null;
    var staux = "worker";
    if ( data != null && staux in data) {
        workers = data[staux];
        apply_worker_generica( "ftp", workers);
        apply_worker_generica( "http", workers);
        apply_worker_generica( "serial_publica", workers);
        apply_worker_generica( "serial_abs", workers);
        apply_tcp_all( workers);
    }
}

function apply_worker_generica( staux, data) {
    var worker = null;
    if ( data != null && staux in data) {
        worker = data[staux];
    } else {
        worker = null;
    }
    if ( worker != null) {
        config_current_slices[staux] = worker;
    }
}

function apply_tcp_all( data) {
    var staux = "tcp_all";
    var all_tcp = {};
    var worker = null;

    if ( data != null ) {
        for ( key in data) {
            worker = data[key];
            st1 = "tipo";
            if ( st1 in worker && ( worker[st1] == "tcp_client" || worker[st1] == "tcp_server" ) ) {
                if ( ! ( stmodbustcp in worker)) {
                    worker[stmodbustcp] = 0;
                } else if ( worker[stmodbustcp] != 0) {
                    worker[stmodbustcp] = 1;
                }
                all_tcp[key] = worker;
            }
        }
    }
    if ( Object.keys(all_tcp).length > 0 ) {
        config_current_slices[staux] = all_tcp;
        tcp_config_from_finnal_format();
    }
}

function tcp_config_add_jumpers_on_serial( serial, tcpname) {
    var stjump = 'jumpers';
    if ( ! ( serial in config_to_save)) {
        config_to_save[serial] = {};
    }
    if ( ! ( stjump in config_to_save[serial])) {
        config_to_save[serial][stjump] = [];
    }
    config_to_save[serial][stjump].push(tcpname);
}

function tcp_config_clear_jumpers_on_serial( serial) {
    var stjump = 'jumpers';
    if ( ! ( serial in config_to_save)) {
        config_to_save[serial] = {};
    }
    config_to_save[serial][stjump] = [];
}

function fw_src_ips_text2array(data) {
    var arr = [];
    if ( data)    arr = data.split(/\s+/);
    return arr;
}

function fw_src_ips_array2text(data) {
    var ret = '';
    var nl = '';
    if ( Array.isArray(data)) {
        data.forEach(element => {
            ret += nl + element;
            nl = '\n';
        });
    }
    return ret;
}

function fw_src_ips_line2text(data) {
    var arr = [];
    if ( data)    arr = data.split(/\s+/);
    var ret = '';
    var nl = '';
    if ( Array.isArray(arr)) {
        arr.forEach(e => {
            ret += nl + e;
            nl = '\n';
        });
    }
    return ret;
}

function fw_src_ips_text2line(data) {
    var arr = [];
    if ( data)    arr = data.split(/\s+/);
    var ret = '';
    var nl = '';
    if ( Array.isArray(arr)) {
        arr.forEach(e => {
            ret += nl + e;
            nl = ' ';
        });
    }
    return ret;
}

