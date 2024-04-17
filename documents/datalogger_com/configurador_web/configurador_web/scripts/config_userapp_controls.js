
var div_config_userapp = null;
var div_config_userapp_contador = 0;

get_html('config_userapp');

function userapp_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_userapp == null) {
        div_config_userapp = $('#config_userapp_html').html();
        $('#config_userapp_html').remove();
    }
}

function userapp_set_view() {
    // console.log("userapp_set_view " + $('#userapp_dhcp_conf').children("option:selected").val());
    if (special_configs['fw_multisrc_config_feature_available']){
        $('.div_fw_multisrc_config_feature_available').show();
    } else {
        $('.div_fw_multisrc_config_feature_available').hide();
    }
    if ($('#userapp_allow_on_wancel').children("option:selected").val() == '1') {
        $( '#userapp_div_allowed_ips').show();
    } else {
        $( '#userapp_div_allowed_ips').hide();
    }
    if ($('#userapp_allow_on_lan').children("option:selected").val() == '1') {
        $( '#userapp_div_allowed_lan_ips').show();
    } else {
        $( '#userapp_div_allowed_lan_ips').hide();
    }
    if ($('#userapp_allow_on_ovpn').children("option:selected").val() == '1') {
        $( '#userapp_div_allowed_ovpn_ips').show();
    } else {
        $( '#userapp_div_allowed_ovpn_ips').hide();
    }
    if ($('#userapp_allow_on_ipsec').children("option:selected").val() == '1') {
        $( '#userapp_div_allowed_ipsec_ips').show();
    } else {
        $( '#userapp_div_allowed_ipsec_ips').hide();
    }
}

function userapp_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'userapp');
}

function userapp_config_show() {
    console.log("entrou userapp_config_show");
    block_other_acctions();
    userapp_prepare_html();
    var already_open = tags_configurar_show( stuserapp, div_config_userapp);
    if ( ! already_open) {
        if ( special_configs['celmodem_available']) {
            $('#div_userapp_allow_on_wancel').show();
        } else {
            $('#div_userapp_allow_on_wancel').hide();
        }
        $('#userapp_start_application').val(config_to_save[stuserapp]['enabled']);
        $('#userapp_package_file').val(config_to_save[stuserapp]['pacote']);
        $('#userapp_lock_package').val(config_to_save[stuserapp]['lock']);
        $('#userapp_enable_httpd').val(config_to_save[stuserapp]['http']['enabled']);
        $('#userapp_httpd_port').val(config_to_save[stuserapp]['http']['port']);

        $('#userapp_allow_on_wancel').val(config_to_save[stuserapp]['http']['allow_http_on_wancel']);
        $('#userapp_allow_on_lan').val(config_to_save[stuserapp]['http']['allow_http_on_lan']);
        $('#userapp_allow_on_ovpn').val(config_to_save[stuserapp]['http']['allow_http_on_ovpn']);
        $('#userapp_allow_on_ipsec').val(config_to_save[stuserapp]['http']['allow_http_on_ipsec']);
        if ( ! ('allowed_ips' in config_to_save[stuserapp]['http'])) {
            config_to_save[stuserapp]['http']['allowed_ips'] = [];
        }
        if ( ! ('allowed_ips_from_lan' in config_to_save[stuserapp]['http'])) {
            config_to_save[stuserapp]['http']['allowed_ips_from_lan'] = [];
        }
        if ( ! ('allowed_ips_from_ovpn' in config_to_save[stuserapp]['http'])) {
            config_to_save[stuserapp]['http']['allowed_ips_from_ovpn'] = [];
        }
        if ( ! ('allowed_ips_from_ipsec' in config_to_save[stuserapp]['http'])) {
            config_to_save[stuserapp]['http']['allowed_ips_from_ipsec'] = [];
        }
        $('#id_userapp_wancel_allowed_ips').val(fw_src_ips_array2text(config_to_save[stuserapp]['http']['allowed_ips']));
        $('#id_userapp_lan_allowed_ips').val(fw_src_ips_array2text(config_to_save[stuserapp]['http']['allowed_ips_from_lan']));
        $('#id_userapp_ovpn_allowed_ips').val(fw_src_ips_array2text(config_to_save[stuserapp]['http']['allowed_ips_from_ovpn']));
        $('#id_userapp_ipsec_allowed_ips').val(fw_src_ips_array2text(config_to_save[stuserapp]['http']['allowed_ips_from_ipsec']));
        
        userapp_set_view();
    }
}

function userapp_edit_confirm( event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( stuserapp in config_to_save)) {
        config_to_save[stuserapp] = {};
    }
    config_to_save[stuserapp]['enabled'] = $('#userapp_start_application').val();
    config_to_save[stuserapp]['pacote'] = $('#userapp_package_file').val();
    config_to_save[stuserapp]['lock'] = $('#userapp_lock_package').val();
    config_to_save[stuserapp]['http']['enabled'] = $('#userapp_enable_httpd').val();
    config_to_save[stuserapp]['http']['port'] = $('#userapp_httpd_port').val();


    config_to_save[stuserapp]['http']['allow_http_on_wancel'] = $('#userapp_allow_on_wancel').val();
    config_to_save[stuserapp]['http']['allow_http_on_lan'] = $('#userapp_allow_on_lan').val();
    config_to_save[stuserapp]['http']['allow_http_on_ovpn'] = $('#userapp_allow_on_ovpn').val();
    config_to_save[stuserapp]['http']['allow_http_on_ipsec'] = $('#userapp_allow_on_ipsec').val();
    config_to_save[stuserapp]['http']['allowed_ips'] = fw_src_ips_text2array($('#id_userapp_wancel_allowed_ips').val());
    config_to_save[stuserapp]['http']['allowed_ips_from_lan'] = fw_src_ips_text2array($('#id_userapp_lan_allowed_ips').val());
    config_to_save[stuserapp]['http']['allowed_ips_from_ovpn'] = fw_src_ips_text2array($('#id_userapp_ovpn_allowed_ips').val());
    config_to_save[stuserapp]['http']['allowed_ips_from_ipsec'] = fw_src_ips_text2array($('#id_userapp_ipsec_allowed_ips').val());

    tags_configurar_close( stuserapp);
    config_has_been_changed(stuserapp)
    set_conversor_config_show_changes_on_page();
}

function userapp_handleFileSelect(evt) {
    console.log('Estrutura do arquivo ' + JSON.stringify(evt.target.files[0]));
    var f = evt.target.files[0]; // FileList object
    var reader = new FileReader();
    console.log('Taget id = ' + evt.target.id);
    var stcunteudo = 'userapp_package_file';
    var filename = evt.target.files[0].name;
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        var binaryData = e.target.result;
        //Converting Binary Data to base 64
        var base64String = window.btoa(binaryData);
        //showing file converted to base64
        document.getElementById(stcunteudo).value = base64String;
      };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsBinaryString(f);
}
