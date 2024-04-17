
var div_config_dhcp = null;
var div_config_dhcpleases = null;
var div_config_dhcplease_contadors = 0;

get_html('config_dhcp');
get_html('config_dhcplease_each');

function dhcp_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_dhcp == null) {
        div_config_dhcp = $('#config_dhcp_html').html();
        $('#config_dhcp_html').remove();
    }
    if ( div_config_dhcpleases == null) {
        div_config_dhcpleases = $('#config_dhcplease_each_html').html();
        $('#config_dhcplease_each_html').remove();
    }
}

function dhcp_set_view() {
}

function dhcp_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'dhcp');
}

function dhcp_config_show() {
    console.log("entrou dhcp_config_show");
    block_other_acctions();
    dhcp_prepare_html();
    var already_open = tags_configurar_show( stdhcp, div_config_dhcp);
    if ( ! already_open) {
        var ses = config_to_save[stdhcp];
        var sdhcp = ses["service"]["wan"];
        $('#dhcp_mode').val(sdhcp['modo']);
        $('#dhcp_start').val(sdhcp['start']);
        $('#dhcp_limit').val(sdhcp['limit']);
        $('#dhcp_leasetime').val(sdhcp['leasetime']);
        $('#dhcp_gateway').val(sdhcp['gateway']);
        $('#dhcp_netmask').val(sdhcp['netmask']);
        $('#dhcp_dns_pri').val(sdhcp['DNS_pri']);
        $('#dhcp_dns_sec').val(sdhcp['DNS_sec']);
        $('#dhcp_secure_lease').val(sdhcp['secure_lease']);
        // TODO - incluir aqui as static leases
        var sleases = config_to_save[stdhcp]['static_leases'];
        if (sleases) {
            var qtd = sleases.length;
            for ( var i = 0; i < qtd; i++) {
                dhcp_add_new_static_lease();
            }
            var idx = 0;
            var rule = null;
            $('#div_dhcp_statis_leases :input').each( function( e) {
                if ( this.id == 'dhcpleases_ip') {
                    rule = sleases[idx++];
                    $(this).val( rule['ip']);
                } else if ( this.id == 'dhcpleases_mac') {
                    $(this).val( rule['mac']);
                } else if ( this.id == 'dhcpleases_name') {
                    $(this).val( rule['name']);
                }
            });
        }

        dhcp_set_view();
    }
}

function dhcp_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( stdhcp in config_to_save)) {
        config_to_save[stdhcp] = {};
    }
    var ses = config_to_save[stdhcp];
    var sdhcp = ses["service"]["wan"];
    sdhcp['modo'] = $('#dhcp_mode').val();
    sdhcp['start'] = $('#dhcp_start').val();
    sdhcp['limit'] = $('#dhcp_limit').val();
    sdhcp['leasetime'] = $('#dhcp_leasetime').val();
    sdhcp['gateway'] = $('#dhcp_gateway').val();
    sdhcp['netmask'] = $('#dhcp_netmask').val();
    sdhcp['DNS_pri'] = $('#dhcp_dns_pri').val();
    sdhcp['DNS_sec'] = $('#dhcp_dns_sec').val();
    sdhcp['secure_lease'] = $('#dhcp_secure_lease').val();

    var sessleases = [];
    var newrule = null;
    $('#div_dhcp_statis_leases :input').each( function( e) {
        if ( this.id == 'dhcpleases_ip') {
            if ( newrule != null && Object.keys(newrule).length > 2) {
                sessleases.push(newrule);
            }
            newrule = {};
            newrule['ip'] = $(this).val();
        } else if ( this.id == 'dhcpleases_mac') {
            newrule['mac'] = $(this).val();
        } else if ( this.id == 'dhcpleases_name') {
            newrule['name'] = $(this).val();
        }
    });
    // Para adicionar a ultima regra que cai fora do each
    if ( newrule != null && Object.keys(newrule).length > 2) {
        sessleases.push(newrule);
    }
    config_to_save[stdhcp]['static_leases'] = sessleases

    tags_configurar_close( 'dhcp');
    config_has_been_changed(stdhcp)
    set_conversor_config_show_changes_on_page();
}

function dhcp_add_new_static_lease() {
    var stprefix = '_' + div_config_dhcplease_contadors++ + '_';
    var newstr = div_config_dhcpleases.replace('div_config_dhcpleases', stprefix + 'div_config_dhcpleases');
    newstr = newstr.replace('id_dhcpleases_del', stprefix);
    $('#div_dhcp_statis_leases').append(newstr);
}

function poezeronafrente( num) {
    if ( num <= 9)  return "0" + num;
    return num;
}

function formatadata( current_datetime) {
    var saida = '';
    saida += poezeronafrente(current_datetime.getDate());
    saida += '/';
    saida += poezeronafrente(current_datetime.getMonth() + 1);
    saida += '/';
    saida += poezeronafrente(current_datetime.getFullYear());
    saida += ' ';
    saida += poezeronafrente(current_datetime.getHours());
    saida += ':';
    saida += poezeronafrente(current_datetime.getMinutes());
    saida += ':';
    saida += poezeronafrente(current_datetime.getSeconds());
    return saida;
}

function prepara_currente_leases( lineString) {
    var date = new Date();
    var timestamp = date.getTime();
    //console.log(" timestamp " + timestamp);
    //console.log(" date " + date.toString());
    
    var saida = '';
    var linhas = lineString.match(/[^\r\n]+/g);
    var basetime = null;
    linhas.forEach( e => {
        //console.log("Linha " + e);
        if ( basetime == null) {
            basetime = parseInt(e.trim());
        } else {
            var partes = e.split(/\s/);
            //console.log(" partes " + JSON.stringify( partes));
            var timediff = (parseInt(partes[0]) - basetime);
            //console.log(" Diff time " + timediff);
            var newts = timestamp + (timediff * 1000);
            var current_datetime = new Date(newts);
            //console.log("Data " + formatadata(current_datetime));
            saida += formatadata(current_datetime) + " " + partes[1] + " " + partes[2] + " " + partes[3] + " " + partes[4] + "\n";
        }
    });
    return saida;
}

function dhcp_get_current_leases() {
   var div_target = 'div_dhcp_current_leases_list';
    $('#' + div_target).empty();
    var aux = {
        "cmd": "get_net_diag",
        "parms": { 
            "kind": 'dhcp_leases',
            "destination": 'get'
        }
    };
    __diagnostics_send( aux, div_target, prepara_currente_leases);
}
