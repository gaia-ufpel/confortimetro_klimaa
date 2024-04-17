
var div_config_router = null;

get_html('config_router');

function router_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_router == null) {
        div_config_router = $('#config_router_html').html();
        $('#config_router_html').remove();
    }
}

function router_set_view() {
    if ($('#router_dhcp_conf').children("option:selected").val() == '1') {
        $( '#router_config_dhcp_parameters').show();
    } else {
        $( '#router_config_dhcp_parameters').hide();
    }
}

function router_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'router');
}

function router_config_show() {
    console.log("entrou router_config_show");
    block_other_acctions();
    router_prepare_html();
    var already_open = tags_configurar_show( strouter, div_config_router);
    if ( ! already_open) {
        if (special_configs['router_feature_on_link']) {
            $( '#div_config_router_general').hide();
            $( '#div_config_router_por_link').show();
        } else {
            $( '#div_config_router_general').show();
            $( '#div_config_router_por_link').hide();
        }
        if (special_configs['router_feature_on_link']) {
            $('#router_route_eth_cel').val( ! config_to_save['router']['wan_wanCel'] ? "0" : config_to_save['router']['wan_wanCel']);
            $('#router_route_cel_eth').val( ! config_to_save['router']['wanCel_wan'] ? "0" : config_to_save['router']['wanCel_wan']);
            if (special_configs['ovpn_feature_available']) {
                $('#router_route_eth_ovpn').val( ! config_to_save['router']['wan_ovpn'] ? "0" : config_to_save['router']['wan_ovpn']);
                $('#router_route_ovpn_eth').val( ! config_to_save['router']['ovpn_wan'] ? "0" : config_to_save['router']['ovpn_wan']);
                if (config_to_save[stovpn]['enabled'] !== '0')
                    $('#div_config_routing_ovpn_wan_available').show();
                else
                    $('#div_config_routing_ovpn_wan_available').hide();
            } else {
                $('#div_config_routing_ovpn_wan_available').hide();
            }
            if (special_configs['routing_ipsec_wan_available']) {
                $('#router_route_eth_ipsec').val( ! config_to_save['router']['wan_ipsec'] ? "0" : config_to_save['router']['wan_ipsec']);
                $('#router_route_ipsec_eth').val( ! config_to_save['router']['ipsec_wan'] ? "0" : config_to_save['router']['ipsec_wan']);
                if (config_to_save[stipsec]['enabled'] !== '0')
                    $('#div_config_routing_ipsec_wan_available').show();
                else
                    $('#div_config_routing_ipsec_wan_available').hide();
            } else {
                $('#div_config_routing_ipsec_wan_available').hide();
            }
        } else {
            var ses = config_to_save[strouter];
            var sdhcp = ses[stdhcpserver];
            $('#router_acct_as_one').val(ses['enabled']);
            $('#router_dhcp_conf').val(sdhcp['enabled']);
            $('#router_dhcp_start').val(sdhcp['start']);
            $('#router_dhcp_limit').val(sdhcp['limit']);
            $('#router_dhcp_leasetime').val(sdhcp['leasetime']);
        }
        router_set_view();
    }
}

function router_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( strouter in config_to_save)) {
        config_to_save[strouter] = {};
    }
    if (special_configs['router_feature_on_link']) {
        config_to_save['router']['wan_wanCel'] = $('#router_route_eth_cel').val();
        config_to_save['router']['wanCel_wan'] = $('#router_route_cel_eth').val();
        config_to_save['router']['wan_ovpn'] = $('#router_route_eth_ovpn').val();
        config_to_save['router']['ovpn_wan'] = $('#router_route_ovpn_eth').val();
        if (special_configs['routing_ipsec_wan_available']) {
            config_to_save['router']['wan_ipsec'] = $('#router_route_eth_ipsec').val();
            config_to_save['router']['ipsec_wan'] = $('#router_route_ipsec_eth').val();
        }
    } else {
        config_to_save[strouter]['enabled'] = $('#router_acct_as_one').val();
        config_to_save[strouter][stdhcpserver]['enabled'] = $('#router_dhcp_conf').val();
        config_to_save[strouter][stdhcpserver]['start'] = $('#router_dhcp_start').val();
        config_to_save[strouter][stdhcpserver]['limit'] = $('#router_dhcp_limit').val();
        config_to_save[strouter][stdhcpserver]['leasetime'] = $('#router_dhcp_leasetime').val();
    }
    // O dhcp server so pode estar habilitado se o roteamento tambem estiver
    tags_configurar_close( 'router');
    if ( config_to_save[strouter]['enabled'] == 0) {
        config_to_save[strouter][stdhcpserver]['enabled'] = '0';
    }
    config_has_been_changed(strouter)
    set_conversor_config_show_changes_on_page();
}