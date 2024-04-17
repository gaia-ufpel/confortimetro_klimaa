
var div_config_serial = null;

get_html('config_serial');

function serial_prepare_html() {
    // ATENCAO - tem que ser chamada na _show para pegar as divs
    if ( div_config_serial == null) {
        div_config_serial = $('#config_serial_html').html();
        $('#config_serial_html').remove();
    }
}

function serial_edit_cancel(event) {
    event.stopPropagation();
    free_other_acctions();
    tags_configurar_close( 'serial');
}

function serial_config_show() {
    console.log("entrou serial_config_show");
    block_other_acctions();
    serial_prepare_html();
    var already_open = tags_configurar_show( 'serial', div_config_serial);
    
    console.log('Special config two serial ports ' +  special_configs['two_serial_ports']);

    if (special_configs['two_serial_ports']) {
        $('#serial_second_port').show();
    } else {
        $('#serial_second_port').hide();
    }
    
    if ( ! already_open) {
        if ( ! ( 'serial_publica' in config_to_save)) {
            config_to_save['serial_publica'] = { 'baudrate' : 9600, 'cs':8,'par':'none','stopbit':1};
        }
        $('#serial_baudrate').val(config_to_save['serial_publica']['baudrate']);
        $('#serial_cs').val(config_to_save['serial_publica']['cs']);
        $('#serial_parity').val(config_to_save['serial_publica']['par']);
        $('#serial_stopbit').val(config_to_save['serial_publica']['stopbit']);

        if (special_configs['two_serial_ports']) {
            console.log('Confg serial abs ' + JSON.stringify(config_to_save['serial_abs'], null, 4));
            if ( ! ( 'serial_abs' in config_to_save)) {
                config_to_save['serial_abs'] = { 'baudrate' : 4800, 'cs':8,'par':'none','stopbit':1};
            }
            if ( ! ('baudrate' in config_to_save['serial_abs'])) {
                config_to_save['serial_abs']['baudrate'] = 4800;
            }
            if ( ! ('cs' in config_to_save['serial_abs'])) {
                config_to_save['serial_abs']['cs'] = 8;
            }
            if ( ! ('par' in config_to_save['serial_abs'])) {
                config_to_save['serial_abs']['par'] = 'none';
            }
            if ( ! ('stopbit' in config_to_save['serial_abs'])) {
                config_to_save['serial_abs']['stopbit'] = 1;
            }
            console.log('Confg serial abs ' + JSON.stringify(config_to_save['serial_abs'], null, 4));
            $('#serial2_baudrate').val(config_to_save['serial_abs']['baudrate']);
            $('#serial2_cs').val(config_to_save['serial_abs']['cs']);
            $('#serial2_parity').val(config_to_save['serial_abs']['par']);
            $('#serial2_stopbit').val(config_to_save['serial_abs']['stopbit']);
        }
    }
}

function serial_edit_confirm(event) {
    event.stopPropagation();
    free_other_acctions();
    if ( ! ( 'serial_publica' in config_to_save)) {
        config_to_save['serial_publica'] = {};
    }
    config_to_save['serial_publica']['baudrate'] = $('#serial_baudrate').val();
    config_to_save['serial_publica']['cs'] = $('#serial_cs').val();
    config_to_save['serial_publica']['par'] = $('#serial_parity').val();
    config_to_save['serial_publica']['stopbit'] = $('#serial_stopbit').val();
    config_has_been_changed('serial_publica')
    if (special_configs['two_serial_ports']) {
        if ( ! ( 'serial_abs' in config_to_save)) {
            config_to_save['serial_abs'] = {};
        }
        config_to_save['serial_abs']['baudrate'] = $('#serial2_baudrate').val();
        config_to_save['serial_abs']['cs'] = $('#serial2_cs').val();
        config_to_save['serial_abs']['par'] = $('#serial2_parity').val();
        config_to_save['serial_abs']['stopbit'] = $('#serial2_stopbit').val();
        config_has_been_changed('serial_abs')
    }
    tags_configurar_close( 'serial');
    set_conversor_config_show_changes_on_page();
}