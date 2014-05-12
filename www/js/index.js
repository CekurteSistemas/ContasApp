/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    db: null,

    value: {
        'tipo-despesa'      : null,
        'forma-pagamento'   : null,
        'conta'             : null,
        'valor'             : null
    },

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    getValue: function(key) {
        return app.value[key];
    },

    createTable: function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS contas (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, tipo_despesa VARCHAR(255), forma_pagamento VARCHAR(255), conta VARCHAR(255), valor VARCHAR(255), data VARCHAR(255))');
    },

    inserirConta: function(tx) {

        var date = new Date();

        var dateTime = moment.utc(date).format('YYYY-MM-DD HH:mm:ss');

        var sql = 'INSERT INTO contas (tipo_despesa, forma_pagamento, conta, valor, data) VALUES (';

        sql += '"' + app.value['tipo-despesa']      + '", ';
        sql += '"' + app.value['forma-pagamento']   + '", ';

        if (app.value['conta'] != null) {
            sql += '"' + app.value['conta']         + '", ';
        } else {
            sql += 'null, ';
        }

        sql += '"' + app.value['valor']             + '", ';
        sql += '"' + dateTime                       + '"';

        sql += ')';

        tx.executeSql(sql);
    },

    successCB: function() {
        // alert("success!");
    },

    errorCB: function(error) {
        alert("Error processing SQL [" + error.code + ']: ' + error.message);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        // -----------------------------------------------------------------
        // Cria a base de dados

        app.db = window.openDatabase('contas', '1.0', 'Contas Mensais', 1000000);

        app.db.transaction(app.createTable, app.errorCB, app.successCB);

        // -----------------------------------------------------------------
        // Evento disparado ao selecionar uma página

        $(document).on('pagechange', function() {

            var idPageActive = $('.ui-page-active', 'body').attr('id');

            if (idPageActive === 'resumo') {

                $('#resumo .tipo-despesa').val(app.value['tipo-despesa']);

                $('#resumo .valor').val(app.value['valor']);

                $('#resumo .forma-pagamento').val(app.value['forma-pagamento']);

                if (app.value['conta'] != null) {
                    $('#resumo .conta').val(app.value['conta']);
                }

            } else if (idPageActive === 'despesa') {

                $(document).find('#despesa .valor').maskMoney({
                    'symbol'    : 'R$',
                    'decimal'   : ',',
                    'thousands' : '.'
                });
            } else if (idPageActive === 'listar') {


            }

            return false;
        });

        // -----------------------------------------------------------------
        // Atualiza o objeto que armazena os valores informados pelo usuário

        $(document).on('click', '.ui-content ul[data-role="listview"] li a', function() {

            var value = $(this).data('value');

            if (value) {
                app.value[$(this).data('value')] = $(this).text();
            }
        });

        $(document).on('click', '#despesa #avancar', function() {
            app.value['valor'] = $('#despesa .valor').val();
        });

        // -----------------------------------------------------------------
        // Manipula o botão sincronizar

        $(document).on('click', '#sincronizar .sincronizar', function() {

            var networkState = navigator.connection.type;

            if (networkState === Connection.WIFI) {

                alert('Sincronizando...');

            } else {
                alert('Você não está conectado a uma Rede Wifi!');
            }

            return false;
        });

        // -----------------------------------------------------------------
        // Manipula o botão salvar da página de resumo

        $(document).on('click', '#resumo .confirmar', function() {

            app.db.transaction(app.inserirConta, app.errorCB, function() {

                alert('Despesa incluída com sucesso!');

                $.mobile.changePage('index.html', {
                    transition: "slide"
                });
            });
        })
    },
};