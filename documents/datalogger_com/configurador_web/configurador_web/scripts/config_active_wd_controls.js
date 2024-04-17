
var div_config_active_wd = null;

get_html('config_active_wd');

function active_wd_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_active_wd == null) {
        div_config_active_wd = $('#config_active_wd_html').html();
        $('#config_active_wd_html').remove();
    }
}

function active_wd_set_view() {
    /*
    if ($('#active_wd_acct_as_one').children("option:selected").val() == '1') {
        $( '#active_wd_config_parameters').show();
    } else {
        $( '#active_wd_config_parameters').hide();
    }
    if ($('#active_wd_dhcp_conf').children("option:selected").val() == '1') {
        $( '#active_wd_config_dhcp_parameters').show();
    } else {
        $( '#active_wd_config_dhcp_parameters').hide();
    }
    */
}

function active_wd_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'active_wd');
}

function active_wd_config_show() {
    console.log("entrou active_wd_config_show");
    block_other_acctions();
    active_wd_prepare_html();
    var already_open = tags_configurar_show( stactive_wd, div_config_active_wd);
    if ( ! already_open) {
        var ses = config_to_save['wd_active_connection'];
        if (ses['enabled'] == true) {
            ses['enabled'] = '1';
        } else {
            ses['enabled'] = '0';
        }
        $('#active_wd_enabled').val(ses['enabled']);
        $('#active_wd_interface').val(ses['interface']);
        $('#active_wd_ip_to').val(ses['ipdest']);
        $('#active_wd_burst_size').val(ses['burst_size']);
        $('#active_wd_interval').val(ses['interval']);
        $('#active_wd_max_wait').val(ses['max_wait']);
        if ( ! special_configs['ping_keepalive_wan_feature_available']) {
            $("#active_wd_interface option[value='wan']").remove();
        }
        active_wd_set_view();
    }
}

function active_wd_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    staux = 'wd_active_connection';
    if ( ! ( staux in config_to_save)) {
        config_to_save[staux] = {};
    }
    config_to_save[staux]['enabled'] = $('#active_wd_enabled').val();
    config_to_save[staux]['interface'] = $('#active_wd_interface').val();
    config_to_save[staux]['ipdest'] = $('#active_wd_ip_to').val();
    config_to_save[staux]['burst_size'] = $('#active_wd_burst_size').val();
    config_to_save[staux]['interval'] = $('#active_wd_interval').val();
    config_to_save[staux]['max_wait'] = $('#active_wd_max_wait').val();
    // O dhcp server so pode estar habilitado se o roteamento tambem estiver
    tags_configurar_close( 'active_wd');
    config_has_been_changed('wd_active_connection')
    set_conversor_config_show_changes_on_page();
}