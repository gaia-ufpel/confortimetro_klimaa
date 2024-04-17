
function tcp_config_to_finnal_format() {
    // transforma o formato interno da interface para o formato final de configuracao
    console.log("tcp_config_to_finnal_format - Dados para transforamr " + JSON.stringify(tcp_all_configured, null, 4));
    var staux = "tcp_all";
    var r = {};    // vamos colocar aqui os dados transformados
    // TODO         tcp_all_configured   ->     r
    var os = tcp_all_configured[sttooutside];
    var is = tcp_all_configured[sttoinside];

    for ( var name in os) {
        if ( os[name] == null)  continue;   // nao tem nada dentro
        var key = 'os_' + name;
        r[key] = JSON.parse( JSON.stringify(os[name]));
    }
    for ( var name in is) {
        if ( is[name] == null)  continue;   // nao tem nada dentro
        var key = 'is_' + name;
        r[key] = JSON.parse( JSON.stringify(is[name]));
        r[key]['jumpers'] = [];
    }
    // Agora acerta os jumpers e multiplex

    // Limpa os jumpers das seriais pois novos foram adicionados
    tcp_config_clear_jumpers_on_serial('serial_publica');
    tcp_config_clear_jumpers_on_serial('serial_abs');
    for ( var osname in r) {
        var myjumpers = [];
        var mympx = {};

        if ( ! (stlkto in r[osname])) continue;   // nao tem linked_to
        var lk = r[osname][ stlkto];
        if (lk.length == 0) continue;   // eh to_inside
        console.log(" Teste para ver se prepara multiplex ou jumpers hosttype " + r[osname]['hosttype'] + "  lk lenght " + JSON.stringify(lk));
        // ALEX 2020 09 21 o multiplexador caiu em desuso - vamos deixar aqui mas nao usar o codigo
        if ( false && r[osname]['hosttype'] == '0' && lk.length > 1) {
            // preparar o multiplex
            for ( var idx in lk) {
                var canal = '0';
                var name = lk[idx];
                if ( name == 'serials') {
                    if ( ! (canal in mympx)) {
                        mympx[canal] = [];
                    }
                    mympx[canal].push('serial_publica');
                    tcp_config_add_jumpers_on_serial('serial_publica', osname);
                    mympx[canal].push('serial_abs');
                    tcp_config_add_jumpers_on_serial('serial_abs', osname);
                } else if ( name == 'serial_publica' || name == 'serial_abs' ) {
                    if ( ! (canal in mympx)) {
                        mympx[canal] = [];
                    }
                    mympx[canal].push( name);
                    tcp_config_add_jumpers_on_serial(name, osname);
                } else {
                    var isname = 'is_' + name;
                    canal = parseInt(name);
                    if ( ( isname in r ) && ( stjump in r[isname])) {
                        if ( ! (canal in mympx)) {
                            mympx[canal] = [];
                        }
                        mympx[canal].push( isname);
                        // colocar o jumper para out na in
                        r[isname][stjump].push(osname)
                        // adicionar os parametros para evitar que as in usem o LED
                        r[isname]['communicate_fail'] = '0';
                        r[isname]['use_LED'] = '0';
                    }
                }
            }
            r[osname][stmpx] = mympx;
        } else {
            for ( var idx in lk) {
                var name = lk[idx];
                if ( name == 'serials') {
                    myjumpers.push('serial_publica');
                    tcp_config_add_jumpers_on_serial('serial_publica', osname);
                    myjumpers.push('serial_abs');
                    tcp_config_add_jumpers_on_serial('serial_abs', osname);
                    // TODO ligar as seriais a este tcp
                } else if ( name == 'serial_publica' || name == 'serial_abs') {
                    myjumpers.push(name);
                    tcp_config_add_jumpers_on_serial(name, osname);
                } else {
                    var isname = 'is_' + name;
                    if ( ( isname in r ) && ( stjump in r[isname])) {
                        myjumpers.push( isname);
                        // colocar o jumper para out na in
                        r[isname][stjump].push(osname)
                    }
                }
            }
            r[osname][stjump] = myjumpers;
        }
        delete (r[osname])[stlkto];
    }

    console.log("tcp_config_to_finnal_format - Dados transformados " + JSON.stringify(r, null, 4));
    config_to_save[staux] = r;
}


function __tcp_config_is_ip_or_hostname( value) {
    // -1 nao reconheceu   -  0 IP   1  hostname
    if (value.length === 0 || value.length > 511) {
        return -1;
    }

    var regExpIp = new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
    var regResultIp = regExpIp.exec(value);
    var regExpHostname = new RegExp(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/); // RFC 1123
    var regResultHostname = regExpHostname.exec(value);
    if (regResultIp === null && regResultHostname === null) {
        return -1;
    }
    if (regResultIp !== null) {
        return 0;
    }
    return 1;
}

function __tcp_config_smells_as_outsde( w, name) {
    // retorna 0 se tiver certeza, e cada vez menor o numero segundo a desconfianca
    if (name.substring(0,4) == "os_0") {
        return 0;
    } else if (name.substring(0,4) == "is_0") {
        return -9999;
    } else if ( stmpx in w) {
        return 0;
    } else if ( w[sttipo] == "tcp_client" && ( w[sthtt] == '0' || w[sthtt] == '1')) {
        return 0;
    } else if ( (stjump in w) && (w[stjump].includes('serial_publica') || w[stjump].includes('serial_abs'))) {
        return 0;
    }
    //  TODO classificar ainda os tcp_server e tcp_client hosttype 2
    if ( w[sttipo] == "tcp_server" && ( w[stallocelmod] != '0' && w[stallocelmod] != 0 && w[stallocelmod].toUpperCase() != 'FALSE')) {
        //  como esta habilitado para atender pela interface celular tem tudo para ser uma outside
        return -1;
    }
    if ( w[sttipo] == "tcp_client" && w[sthtt] == '2') {
        if ( ! ( sthostandport in w) || w[sthostandport].length < 1) {
            console.log("tcp_client com configuracao errada de hostname and port");
            return -9999;    // isso eh lixo, nao tem configuracao de hostname_and_port
        } else {
            for ( var idx in w[sthostandport]) {
                var hostaport = w[sthostandport][idx].split(":");
                var hostname = hostaport[0];
                var ehhostname = __tcp_config_is_ip_or_hostname( hostname);
                if ( ehhostname < 0) {
                    console.log("tcp_client com configuracao errada de hostname and port. hostname invalido " + hostname);
                    return -9999;    // hostname ou ip inserido eh invalido
                }
                // se apontar por hostname nao terminado por .lan tem chance de ser outside
                var lansufix = false;
                if ( ehhostname == 1) {
                    var hostsufix = hostname.slice(-4);
                    if ( hostsufix.toUpperCase() == '.LAN') {
                        lansufix = true;
                    } else {
                        return -1;
                    }
                }
                // se for por IP eh melhor do que se
                if ( ehhostname == 0) {
                    return -2;
                }
                // for hostname terminado por .lan
                if ( lansufix) {
                    return -4;
                }
            }
        }
    }
    return -3;
}

function tcp_config_from_finnal_format() {
    // transforma o formato de configuracao para o formato interno da interface
    var staux = "tcp_all";
    // TODO      config_current_slices    =>     tcp_all_configured
    var all_tcps = config_current_slices[staux];
    var mpxoslist = {};
    var jumposlist = {};
    var oslist = {};
    var islist = {};
    var w;
    tcp_config_reset_tcp_all_configured();  // limpa a configuracao atual
    // Agora passa todas as tcp s para descobrir qual eh outside
    for ( var wname in all_tcps) {
        w = all_tcps[wname];
        console.log("tcp_config_from_finnal_format vendo se tcp eh outside " + wname);
        if ( __tcp_config_smells_as_outsde(w, wname) == 0) {
            console.log("tcp_config_from_finnal_format eh tcp outside " + wname);
            if ( stmpx in w) {
                mpxoslist[wname] = w;
            } else {
                jumposlist[wname] = w;
            }
        }
    }
    // Primeiro passa quem tem multiplex para acetar os canais e as sias inside
    for ( var wname in mpxoslist) {
        var linked_to = [];
        for ( var canal in mpxoslist[wname][stmpx]) {
            for ( var idx in mpxoslist[wname][stmpx][canal]) {
                var wisname = mpxoslist[wname][stmpx][canal][idx];
                if ( wisname == 'serial_publica' || wisname == 'serial_abs') {
                    if ( ! special_configs['two_serial_ports']) {
                        wisname = 'serials';
                    }
                } else {
                    if ( ! (wisname in islist)) {
                        islist[wisname] = {};
                        islist[wisname][stcanal] = -1;
                    }
                    if ( islist[wisname][stcanal] < 0) {
                        islist[wisname][stcanal] = canal;
                    } else {
                        console.log("Worker em mais de 1 multiplex e com canais diferentes " + wisname);
                    }
                }
                if ( jQuery.inArray( wisname, linked_to) === -1) {
                    linked_to.push(wisname);
                }
            }
        }
        if ( linked_to.length > 0) {
            oslist[wname] = {};
            oslist[wname][stlkto] = linked_to;
        }
    }
    // Depois passa os jumposlist para as inside
    for ( var wname in jumposlist) {
        var linked_to = [];
        for ( var idx in jumposlist[wname][stjump]) {
            var wisname = jumposlist[wname][stjump][idx];
            console.log("tcp " + wname + "  jumper to " + idx + "  to " + wisname);
            if ( wisname == 'serial_publica' || wisname == 'serial_abs') {
                if ( ! special_configs['two_serial_ports']) {
                    wisname = 'serials';
                }
            } else {
                if ( ! (wisname in islist)) {
                    islist[wisname] = {};
                    islist[wisname][stcanal] = -1;
                }
            }
            if ( jQuery.inArray( wisname, linked_to) === -1) {
                console.log("tcp " + wname + " adicionando na linked_to " + wisname);
                linked_to.push(wisname);
            }
        }
        if ( linked_to.length > 0) {
            oslist[wname] = {};
            oslist[wname][stlkto] = linked_to;
        }
    }
    // Agora vamos repassar a lista dos tcp s para ver se sobrou alguma sem classificacao e tentar classificar
    for ( var wname in all_tcps) {
        if ( wname in oslist || wname in islist) continue;   // ja esta classificada
        w = all_tcps[wname];
        console.log("tcp_config_from_finnal_format tentando classificar mais uma tcp " + wname);
        // pegar os jumpers dela para ver qual tem mais chance de ser out
        var chance_w = __tcp_config_smells_as_outsde( w, wname);
        var chance_j = -9999;
        var pearname = null;
        if ( stjump in w && w[stjump].length > 0) {
            for (var idx in w[stjump]) {
                var jname = w[stjump][idx];
                if ( jname in all_tcps) {
                    if ( jname in oslist ) continue;   // aponta para uma worker outside que nao aponta para este. nao considera
                    if ( jname in islist ) {
                        // o par ja eh considerado um inside - vamos considerar este um outside
                        pearname = jname;
                        chance_j = -9999;
                        break;
                    } else {
                        pearname = jname;
                        chance_j = __tcp_config_smells_as_outsde( all_tcps[jname]);
                        if ( chance_j < chance_w) break;
                    }
                }
            }
        }
        if ( pearname != null) {
            // consegue fazer alguma comparacao
            var outname = null;
            var inname = null;
            var linked_to = [];
            if ( chance_w >= chance_j) {
                outname = wname;
                inname = pearname;
            } else {
                outname = pearname;
                inname = wname;
            }
            // a wname vai ser considerada outside
            if ( ! (inname in islist)) {
                islist[inname] = {};
                islist[inname][stcanal] = -1;
            }
            linked_to.push(inname);
            oslist[outname] = {};
            oslist[outname][stlkto] = linked_to;
        }
    }

    // varrer as listas resultantes e montar a estrutura interna de representacao
    var o2n = {};   // mapeia os nomes para acerar as ligacoes
    for ( var wname in islist) {
        // Pega somente as in que tenham canal e ja popula com o nome correto
        var ob = islist[wname];
        if ( ob[stcanal] >= 0 ) {
            var stname = ( '0' + ob[stcanal]).slice(-2);
            o2n[wname] = stname;
            tcp_all_configured[sttoinside][stname] = JSON.parse( JSON.stringify( all_tcps[wname]));
        }
    }
    for ( var wname in islist) {
        // Pega as in que nao tem canal e preenche nos canais restantes
        var ob = islist[wname];
        if ( ob[stcanal] < 0 ) {
            var newslot = __tcp_config_get_empty_slot( sttoinside);
            if ( newslot != null) {
                var stname = newslot['name'];
                o2n[wname] = stname;
                tcp_all_configured[sttoinside][stname] = JSON.parse( JSON.stringify( all_tcps[wname]));
            }
        }
    }
    for ( var wname in oslist) {
        var newslot = __tcp_config_get_empty_slot( sttooutside);
        if ( newslot != null) {
            var auxconf = JSON.parse( JSON.stringify( all_tcps[wname]));
            // acertar o linked_to
            auxconf[stlkto] = [];
            for ( var idx in oslist[wname][stlkto]) {
                var stname = oslist[wname][stlkto][idx];
                if ( stname != 'serials' && stname != 'serial_publica' && stname != 'serial_abs') {
                    stname = o2n[stname];
                }
                auxconf[stlkto].push( stname);
            }
            tcp_all_configured[sttooutside][newslot['name']] = auxconf;
        }
    }
    console.log("Dados TCP entrada " + JSON.stringify(all_tcps, null, 4));
    console.log("oslist " + JSON.stringify( oslist, null, 4));
    console.log("islist " + JSON.stringify( islist, null, 4));
    console.log("Dados TCP saida " + JSON.stringify(tcp_all_configured, null, 4));
}
