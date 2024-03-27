
var div_config_dmz = null;

get_html('config_dmz');

function dmz_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_dmz == null) {
        div_config_dmz = $('#config_dmz_html').html();
        $('#config_dmz_html').remove();
    }
}

function dmz_set_view() {
}

function dmz_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'dmz');
}

function dmz_config_show() {
    console.log("entrou dmz_config_show");
    block_other_acctions();
    dmz_prepare_html();
    var already_open = tags_configurar_show( "dmz", div_config_dmz);
    if ( ! already_open) {
        var ses = config_to_save['DMZ'];
        ses.forEach( e => {
            $('#dmz_interface').val(e['src']);
            $('#dmz_enabled').val(e['enabled']);
            $('#dmz_ip_to').val(e['dest_ip']);
        });
        dmz_set_view();
    }
}

function dmz_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    var staux = 'DMZ';
    config_to_save[staux] = [
        {
            "src": $('#dmz_interface').val(),
            "dest_ip": $('#dmz_ip_to').val(),
            'enabled': $('#dmz_enabled').val()
        }
    ];
    // O dhcp server so pode estar habilitado se o roteamento tambem estiver
    tags_configurar_close( 'dmz');
    config_has_been_changed('DMZ')
    set_conversor_config_show_changes_on_page();
}