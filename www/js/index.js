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

    value: {
        'tipo-despesa'      : null,
        'forma-pagamento'   : null,
        'conta'             : null,
        'valor'             : null
    },

    getValue: function(key) {
        return app.value[key];
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
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        // -----------------------------------------------------------------
        // Evento disparado ao selecionar uma página

        $(document).on('pagechange', function() {

            var idPageActive = $('.ui-page-active', 'body').attr('id');

            if (idPageActive === 'resumo') {

                for (var key in app.value) {
                    alert(app.value[key]);
                }

                $('#resumo .tipo-despesa').val(app.value['tipo-despesa']);

                $('#resumo .valor').val(app.value['valor']);

                $('#resumo .forma-pagamento').val(app.value['forma-pagamento']);

                $('#resumo .conta').val(app.value['conta']);

            } else if (idPageActive === 'despesa') {

                $(document).find('#despesa .valor').maskMoney({
                    'symbol'    : 'R$',
                    'decimal'   : ',',
                    'thousands' : '.'
                });
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

            alert('confirmar');

            // navigator.notification.confirm(
            //     'Você confirma a inclusão da despesa abaixo?'   + '\n' +
            //     'Tipo da Despesa: ' + app.value['tipo-despesa'] + '\n' +
            //     'Valor: R$ '        + valor,
            //     function(opcao) {
            //         if (opcao === 1) {
            //             navigator.notification.alert('Despesa incluída com sucesso!', function(){}, 'Confirmação', 'Fechar');
            //         }
            //     },
            //     'Incluir Despesas',
            //     'Confirmar,Cancelar'
            // );
        })
    },
};