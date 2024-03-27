
var div_config_schedreboot = null;

get_html('config_schedreboot');

function schedreboot_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_schedreboot == null) {
        div_config_schedreboot = $('#config_schedreboot_html').html();
        $('#config_schedreboot_html').remove();
    }
}

function schedreboot_set_view() {
}

function schedreboot_edit_cancel( event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'schedreboot');
}

function schedreboot_config_show() {
    console.log("entrou schedreboot_config_show");
    block_other_acctions();
    schedreboot_prepare_html();
    var already_open = tags_configurar_show( 'schedreboot', div_config_schedreboot);
    if ( ! already_open) {
        $('#schedreboot_enabled').val(config_to_save['scheduled_reboot']['enabled']);
        $('#schedreboot_day').val(config_to_save['scheduled_reboot']['day']);
        $('#schedreboot_hour').val(config_to_save['scheduled_reboot']['hour']);
        $('#schedreboot_min').val(config_to_save['scheduled_reboot']['min']);
        schedreboot_set_view();
    }
}

function schedreboot_edit_confirm( event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( 'scheduled_reboot' in config_to_save)) {
        config_to_save['scheduled_reboot'] = {};
    }
    config_to_save['scheduled_reboot']['enabled'] = $('#schedreboot_enabled').val();
    config_to_save['scheduled_reboot']['day'] = $('#schedreboot_day').val();
    config_to_save['scheduled_reboot']['hour'] = $('#schedreboot_hour').val();
    config_to_save['scheduled_reboot']['min'] = $('#schedreboot_min').val();
    tags_configurar_close( 'schedreboot');
    config_has_been_changed('scheduled_reboot')
    set_conversor_config_show_changes_on_page();
}