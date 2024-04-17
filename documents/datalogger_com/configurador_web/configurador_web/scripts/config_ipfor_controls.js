
var div_config_ipfor = null;
var div_config_ipfor_each = null;
var ipfor_lista_prop = ['proto', 'dest_ip', 'dest_port', 'src_dport'];


get_html('config_ipfor');
get_html('config_ipfor_each');

function ipfor_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_ipfor == null) {
        div_config_ipfor = $('#config_ipfor_html').html();
        $('#config_ipfor_html').remove();
    }
    if ( div_config_ipfor_each == null) {
        div_config_ipfor_each = $('#config_ipfor_each_html').html();
        $('#config_ipfor_each_html').remove();
    }
}

function ipfor_set_view() {
}

function ipfor_edit_cancel(event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'ipfor');
}

function ipfor_config_show() {
    console.log("entrou ipfor_config_show");
    block_other_acctions();
    ipfor_prepare_html();
    var already_open = tags_configurar_show( 'ipfor', div_config_ipfor);
    if ( ! already_open) {
        if ( ! ( 'ip_forwarding' in config_to_save)) {
            config_to_save['ip_forwarding'] = [];
        }
        var qtd = config_to_save['ip_forwarding'].length;
        for ( var i = 0; i < qtd; i++) {
            ipfor_add_new_rule();
        }
        var idx = 0;
        var rule = null;
        $('#div_ipfor_rules :input').each( function( e) {
            console.log("Regra do ip forwarding " + JSON.stringify(rule));
            if ( this.id == 'ipfor_src_dest') {
                rule = config_to_save['ip_forwarding'][idx++];
                console.log("config_to_save['ip_forwarding'][i] " + JSON.stringify(config_to_save['ip_forwarding'][idx]) + '    indice ' + idx);
                var namesrc = '';
                var namedest = '';
                if (rule['src'] == special_configs['ovpn_zone_name']) {
                    namesrc = 'ovpn'
                } else {
                    namesrc = rule['src']
                }
                if (rule['dest'] == special_configs['ovpn_zone_name']) {
                    namedest = 'ovpn'
                } else {
                    namedest = rule['dest']
                }
                if (namesrc == 'ipsec_fw')  namesrc = 'ipsec';
                if (namedest == 'ipsec_fw')  namedest = 'ipsec';
                if (namesrc == 'wan')  namesrc = 'lan';
                if (namedest == 'wan')  namedest = 'lan';
                var a = namesrc + '2' + namedest;
                $(this).val(a);
            } else if ( rule != null) {
                if (this.id == 'ipfor_src_ip'){
                    $(this).val( fw_src_ips_line2text(rule['src_ip']));
                } else {
                    for ( var i in ipfor_lista_prop) {
                        var a = ipfor_lista_prop[i];
                        if ( this.id == ('ipfor_' + a)) {
                            $(this).val( rule[a]);
                            break;
                        }
                    }
                }
            }
        });
        ipfor_set_view();
    }
}

function ipfor_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    config_to_save['ip_forwarding'] = [];
    var sta = '';
    var newrule = null;
    $('#div_ipfor_rules :input').each( function( e) {
        if ( this.id == 'ipfor_src_dest') {
            // TODO - colocar aqui o teste para ver se a origem eh IPSEC e o source_ip nao pode ser um cidr /0. tem que ser um 24 para cima
            if ( newrule != null && Object.keys(newrule).length > 2) {
                // Vou colocar o DNAT na marra pois no firmware esta tentando achar e acha errado
                newrule['target'] = 'DNAT';
                config_to_save['ip_forwarding'].push(newrule);
            }
            newrule = {};
            if ( $(this).val() == 'lan2wanCel') {
                newrule['src'] = 'wan';
                newrule['dest'] = 'wanCel';
            } else if ( $(this).val() == 'wanCel2lan') {
                newrule['src'] = 'wanCel';
                newrule['dest'] = 'wan';
            } else if ( $(this).val() == 'lan2ovpn') {
                newrule['src'] = 'wan';
                newrule['dest'] = special_configs['ovpn_zone_name'];
            } else if ( $(this).val() == 'ovpn2lan') {
                newrule['src'] = special_configs['ovpn_zone_name'];
                newrule['dest'] = 'wan';
            } else if ( $(this).val() == 'ipsec2lan') {
                newrule['src'] = 'ipsec_fw';
                newrule['dest'] = 'wan';
            }
        } else {
            if (this.id == 'ipfor_src_ip'){
                newrule['src_ip'] = fw_src_ips_text2line($(this).val());
            } else {
                for ( var i in ipfor_lista_prop) {
                    var a = ipfor_lista_prop[i];
                    if ( this.id == ('ipfor_' + a)) {
                        sta = $(this).val();
                        if ( sta != null && sta.length > 0) {
                            newrule[a] = sta;
                            break;
                        }
                    }
                }
            }
        }
    });
    // Para adicionar a ultima regra que cai fora do each
    if ( newrule != null && Object.keys(newrule).length > 2) {
        // Vou colocar o DNAT na marra pois no firmware esta tentando achar e acha errado
        newrule['target'] = 'DNAT';
        config_to_save['ip_forwarding'].push(newrule);
    }
    tags_configurar_close( 'ipfor');
    config_has_been_changed('ip_forwarding')
    set_conversor_config_show_changes_on_page();
}

function ipfor_add_new_rule() {
    var stprefix = '_' + div_config_ipfor_contador++ + '_';
    var newstr = div_config_ipfor_each.replace('div_config_ipfor', stprefix + 'div_config_ipfor');
    newstr = newstr.replace('id_ipfor_del', stprefix);
    $('#div_ipfor_rules').append(newstr);
}
