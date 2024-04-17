
var div_config_ethernet = null;

get_html('config_ethernet');

function ethernet_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_ethernet == null) {
        div_config_ethernet = $('#config_ethernet_html').html();
        $('#config_ethernet_html').remove();
    }
}

function ethernet_set_view() {
    if (special_configs['eth_usb_feature_available']) {
        $( '#div_show_eth_usb_config').show();
    } else {
        $( '#div_show_eth_usb_config').hide();
    }
    // console.log("ethernet_set_view " + $('#ethernet_dhcp_conf').children("option:selected").val());
    if ($('#ethernet_dhcp_conf').children("option:selected").val() == 'static') {
        $( '#ethernet_ip_fixo_config').show();
    } else {
        $( '#ethernet_ip_fixo_config').hide();
    }
    if ($('#ethernet2_dhcp_conf').children("option:selected").val() == 'static') {
        $( '#ethernet2_ip_fixo_config').show();
    } else {
        $( '#ethernet2_ip_fixo_config').hide();
    }
}

function ethernet_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'ethernet');
}

function ethernet_config_show() {
    console.log("entrou ethernet_config_show");
    block_other_acctions();
    ethernet_prepare_html();
    var already_open = tags_configurar_show( 'ethernet', div_config_ethernet);
    if ( ! already_open) {
        if ( ! ( 'network' in config_to_save)) {
            config_to_save['network'] = { 'proto' : 'dhcp', 'dns':'8.8.8.8','ipaddr':'192.168.1.2','gateway':'192.168.1.1','netmask':'255.255.255.0'};
        }
        if ( ! ( 'network2' in config_to_save)) {
            config_to_save['network2'] = { 'proto' : 'dhcp', 'dns':'8.8.8.8','ipaddr':'192.168.1.2','gateway':'192.168.1.1','netmask':'255.255.255.0'};
        }
        $('#ethernet_dhcp_conf').val(config_to_save['network']['proto']);
        $('#ethernet_dns_server').val(config_to_save['network']['dns']);
        $('#ethernet_ip_fixo').val(config_to_save['network']['ipaddr']);
        $('#ethernet_ip_gateway').val(config_to_save['network']['gateway']);
        $('#ethernet_net_mask').val(config_to_save['network']['netmask']);

        $('#ethernet2_dhcp_conf').val(config_to_save['network2']['proto']);
        $('#ethernet2_dns_server').val(config_to_save['network2']['dns']);
        $('#ethernet2_ip_fixo').val(config_to_save['network2']['ipaddr']);
        $('#ethernet2_ip_gateway').val(config_to_save['network2']['gateway']);
        $('#ethernet2_net_mask').val(config_to_save['network2']['netmask']);
        ethernet_set_view();
    }
}

function ethernet_edit_confirm( event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( 'network' in config_to_save)) {
        config_to_save['network'] = {};
    }
    if ( ! ( 'network2' in config_to_save)) {
        config_to_save['network2'] = {};
    }
    config_to_save['network']['proto'] = $('#ethernet_dhcp_conf').val();
    config_to_save['network']['dns'] = $('#ethernet_dns_server').val();
    config_to_save['network']['ipaddr'] = $('#ethernet_ip_fixo').val();
    config_to_save['network']['gateway'] = $('#ethernet_ip_gateway').val();
    config_to_save['network']['netmask'] = $('#ethernet_net_mask').val();

    config_to_save['network2']['proto'] = $('#ethernet2_dhcp_conf').val();
    config_to_save['network2']['dns'] = $('#ethernet2_dns_server').val();
    config_to_save['network2']['ipaddr'] = $('#ethernet2_ip_fixo').val();
    config_to_save['network2']['gateway'] = $('#ethernet2_ip_gateway').val();
    config_to_save['network2']['netmask'] = $('#ethernet2_net_mask').val();
    tags_configurar_close( 'ethernet');
    config_has_been_changed('network')
    config_has_been_changed('network2')
    set_conversor_config_show_changes_on_page();
}