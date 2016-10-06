/**
 * Сервис для создания подписи на клиенте при помощи плагина от Крипто-Про: http://www.cryptopro.ru/products/cades/plugin
 */

var SignatureService = (function() {
    var signConfig = {
            PLUGIN_ID: 'cadesplugin',
            CERTIFICATE_STORE_OBJ_NAME: 'CAPICOM.Store',
            SIGNER_OBJ_NAME: 'CAdESCOM.CPSigner',
            SIGNED_DATA_OBJ_NAME: 'CAdESCOM.CadesSignedData',
            CERT_SELECTION_TITLE: 'Выбор сертификата',
            CERT_SELECTION_MESSAGE: 'Пожалуйста, выберите сертификат для подписи.',
            CAPICOM_CERT_INFO_SUBJECT_SIMPLE_NAME: 0,
            CAPICOM_CERT_INFO_ISSUER_SIMPLE_NAME: 1,
            CADES_BES: 1,
            CAPICOM_ENCODE_BASE64: 0x01,
            CAPICOM_CURRENT_USER_STORE: 2,
            CAPICOM_MY_STORE: "My",
            CAPICOM_STORE_OPEN_READ_ONLY: 0,
            CADESCOM_BASE64_TO_BINARY: 1,
            CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED: 2,
            CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME: 1,
            CAPICOM_CERTIFICATE_FIND_SHA1_HASH: 0,
            opera_crypto_extension_id: "epebfcehmdedogndhlcacafjaacknbcm",
            opera_crypto_extension_name: "CryptoPro Extension for CAdES Browser Plug-in",
            opera_download_chrome_extension_id: "kipjbhgniklcnglfaldilecjomjaddfi",
            opera_download_chrome_extension_name: "Download Chrome Extension",
            chrome_crypto_extension_id: "iifchhfnnmpdbibifmljnfjhpififfog"
        },
        urlConfig = function() { return api ? api.env("urlAccountRequestService") : '' },
        signHandler = {
            getCertificates: function() {
                return new Promise(function(resolve, reject) {
                    cadesplugin.then(function() {
                        if (!!cadesplugin.CreateObjectAsync) {
                            cadesplugin.async_spawn(function*(args) {
                                try {
                                    var certStore = yield cadesplugin.CreateObjectAsync(signConfig.CERTIFICATE_STORE_OBJ_NAME);

                                    if (!certStore) {
                                        console.log("certStore failed");
                                        throw new Error("certStore failed");
                                    }

                                    yield certStore.Open(signConfig.CAPICOM_CURRENT_USER_STORE, signConfig.CAPICOM_MY_STORE, signConfig.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);

                                    var certs = yield certStore.Certificates;
                                    var certCnt = yield certs.Count;

                                    if (certCnt == 0) {
                                        certStore.Close();
                                        console.log('Нет доступных сертификатов');
                                        throw new Error('Нет доступных сертификатов');
                                    }

                                    var listCerts = [];
                                    for (var i = 0; i < certCnt; i++) {
                                        var certItem = yield certs.Item(i + 1);

                                        var cert = {};
                                        var currentDate = new Date();

                                        var ValidToDate = new Date((yield certItem.ValidToDate));
                                        var ValidFromDate = new Date((yield certItem.ValidFromDate));
                                        var Validator = yield certItem.IsValid();
                                        var IsValid = yield Validator.Result;
                                        var HasPrivateKey = yield certItem.HasPrivateKey();

                                        //TODO: uncomment if we need only vaild certificate
                                        /*if (currentDate < ValidToDate && HasPrivateKey && IsValid) {*/
                                        cert['id'] = i;
                                        cert['subjectSimpleName'] = yield certItem.GetInfo(signConfig.CAPICOM_CERT_INFO_SUBJECT_SIMPLE_NAME);
                                        cert['issuerSimpleName'] = yield certItem.GetInfo(signConfig.CAPICOM_CERT_INFO_ISSUER_SIMPLE_NAME);
                                        cert['validFrom'] = ValidFromDate;
                                        cert['validTo'] = ValidToDate;
                                        cert['isValid'] = IsValid;
                                        cert['hasPrivateKey'] = HasPrivateKey;
                                        cert['thumbprint'] = yield certItem.Thumbprint;
                                        cert['origin'] = certItem;
                                        /*}
                                         else {
                                         continue;
                                         }*/

                                        listCerts.push(cert);
                                    }

                                    certStore.Close();

                                    console.log(listCerts);

                                    args[0](listCerts);

                                } catch (ex) {
                                    console.log(ex);
                                    args[1](new Error("Ошибка: " + signHandler.getErrorMessage(ex)));
                                }

                            }, resolve, reject);
                        } else {
                            try {
                                var certStore = cadesplugin.CreateObject(signConfig.CERTIFICATE_STORE_OBJ_NAME);
                                certStore.Open();

                                var certCnt = certStore.Certificates.Count;

                                if (certCnt === 0) {
                                    console.log("Нет доступных сертификатов");
                                    throw new Error("Нет доступных сертификатов");
                                }

                                var fillCertificateWithInfo = function(cert) {
                                    var result = {},
                                        currentDate = new Date();

                                    result['subjectSimpleName'] = cert.GetInfo(signConfig.CAPICOM_CERT_INFO_SUBJECT_SIMPLE_NAME);
                                    result['issuerSimpleName'] = cert.GetInfo(signConfig.CAPICOM_CERT_INFO_ISSUER_SIMPLE_NAME);
                                    result['validFrom'] = new Date(cert.ValidFromDate);
                                    result['validTo'] = new Date(cert.ValidToDate);
                                    result['origin'] = cert;
                                    //TODO: uncomment if we need only vaild certificate
                                    //if (currentDate > result['validTo']) return;
                                    return result;
                                }

                                var certs = new Array();
                                for (var i = 0; i < certCnt; i++) {
                                    var fillCert = fillCertificateWithInfo(certStore.Certificates.Item(i + 1));
                                    if (fillCert) {
                                        fillCert['id'] = i;
                                        certs[certs.length] = fillCert;
                                    }
                                }
                                resolve(certs);

                            } catch (ex) {
                                console.log(ex);
                                reject(new Error("Ошибка: " + signHandler.getErrorMessage(ex)))
                            }
                        }
                    }, function(err) {
                        reject(err);
                    });
                });
            },
            doSign: function(cert, data) {
                return new Promise(function(resolve, reject) {
                    if (!!cadesplugin.CreateObjectAsync) {
                        cadesplugin.async_spawn(function*(args) {
                            var Signature;
                            try {
                                var errormes = "";
                                try {
                                    var oSigner = yield cadesplugin.CreateObjectAsync(signConfig.SIGNER_OBJ_NAME);
                                } catch (err) {
                                    errormes = "Failed to create " + signConfig.SIGNER_OBJ_NAME + ": " + err.number;
                                    console.log(errormes);
                                    throw new Error(errormes);
                                }

                                if (oSigner) {
                                    yield oSigner.propset_Certificate(cert.origin);
                                } else {
                                    errormes = "Failed to create " + signConfig.SIGNER_OBJ_NAME;
                                    console.log(errormes);
                                    throw new Error(errormes);
                                }


                                var oSignedData = yield cadesplugin.CreateObjectAsync(signConfig.SIGNED_DATA_OBJ_NAME);

                                if (args[1]) {
                                    // Данные на подпись ввели
                                    yield oSignedData.propset_ContentEncoding(signConfig.CADESCOM_BASE64_TO_BINARY);
                                    yield oSignedData.propset_Content(args[1]);
                                    try {
                                        Signature = yield oSignedData.SignCades(oSigner, signConfig.CADES_BES, true);
                                    } catch (err) {
                                        errormes = "Не удалось создать подпись из-за ошибки: " + signHandler.getErrorMessage(err);
                                        console.log(errormes);
                                        throw new Error(errormes);
                                    }
                                }
                                args[2](Signature);
                            } catch (err) {
                                args[3](err);
                            }
                        }, cert.thumbprint, data, resolve, reject); //cadesplugin.async_spawn
                    } else {
                        try {
                            var errormes;
                            try {
                                var signer = cadesplugin.CreateObject(signConfig.SIGNER_OBJ_NAME);
                            } catch (err) {
                                errormes = "Failed to create CAdESCOM.CPSigner: " + err.number;
                                console.log(errormes);
                                throw new Error(errormes);
                            }

                            if (signer) {
                                signer.Certificate = cert.origin;
                            } else {
                                errormes = "Failed to create CAdESCOM.CPSigner";
                                console.log(errormes);
                                throw new Error(errormes);
                            }

                            try {
                                var signedData = cadesplugin.CreateObject(signConfig.SIGNED_DATA_OBJ_NAME);
                            } catch (err) {
                                console.log(errormes);
                                throw new Error('Failed to create CAdESCOM.CadesSignedData: ' + err.number);
                            }

                            var signature;

                            if (data) {
                                // Данные на подпись ввели
                                signedData.ContentEncoding = signConfig.CADESCOM_BASE64_TO_BINARY; //CADESCOM_BASE64_TO_BINARY
                                signedData.Content = data;
                                try {
                                    signature = signedData.SignCades(signer, signConfig.CADES_BES, true, signConfig.CAPICOM_ENCODE_BASE64);
                                } catch (err) {
                                    errormes = "Не удалось создать подпись из-за ошибки: " + signHandler.getErrorMessage(err);
                                    console.log(errormes);
                                    throw new Error(errormes);
                                }
                            }
                            resolve(signature);
                        } catch (err) {
                            reject(err);
                        }
                    }
                });
            },
            getSignTemplate: function(data) {
                return new Promise(function(resolve, reject) {
                    if (!data) {
                        reject('Пустой список для подписи');
                    }
                    signHandler.getCertificates().then(certificates => {
                        if (certificates && certificates.length == 0) {
                            throw 'У Вас нет сертификатов для подписи';
                        }

                        if (PGU && PGU.templates.get('Signers')) {
                            var $popup;
                            $.template('Signers', PGU.templates.get('Signers'));
                            $popup = $.tmpl('Signers', { 'certs': certificates });
                            $popup.appendTo('body');
                            // TODO: $popup.find('chooseKeyBtn')
                            $('#chooseKeyBtn').click(function() {
                                var cert = certificates[$("input:radio[name='keys']:checked").val()];
                                console.log(cert);
                                var promises = [],
                                    signs = data;
                                // TODO: Add for arrays, not object
                                for (var prop in signs) {
                                    promises.push(signHandler.doSign(cert, data[prop]));
                                }
                                Promise.all(promises).then(signatureData => {
                                    var i = 0;
                                    for (var prop in signs) {
                                        signs[prop] = signatureData[i];
                                        i++;
                                    }
                                    resolve(signs);
                                }, error => {
                                    reject(error);
                                });
                                $popup.hide();
                            });
                            $popup.show();

                        } else if (PGU && PGU.popup) {
                            var signPopup = PGU.popup.get('signersPopup', {
                                title_text: 'Выбор сертификата',
                                class_name: 'signersPopup',
                                buttons: [],
                                showFunction: function(df) {
                                    certificates.map((cert) => {
                                        if (cert.isValid) {
                                            var child = document.createElement('a');
                                            child.href = 'javascript:';
                                            child.innerText = cert.subjectSimpleName;
                                            child.onclick = function() {
                                                var promises = [],
                                                    signs = data;
                                                // TODO: Add for arrays, not object
                                                for (var prop in signs) {
                                                    promises.push(signHandler.doSign(cert, data[prop]));
                                                }
                                                Promise.all(promises).then(signatureData => {
                                                    var i = 0;
                                                    for (var prop in signs) {
                                                        signs[prop] = signatureData[i];
                                                        i++;
                                                    }
                                                    resolve(signs);
                                                }, error => {
                                                    reject(error);
                                                });
                                                signPopup.hide();
                                            };
                                            $('.signersPopup > .wndContent').empty().append(child);
                                        }
                                    });
                                    df.resolve();
                                }
                            });
                            signPopup.show();
                        } else {
                            var ovr = document.createElement('div');
                            ovr.id = "signServiceModalWindow";
                            ovr.className = "modal-window";

                            var ovr_1 = document.createElement('div');
                            ovr_1.className = "modal-popup";

                            var ovr_2 = document.createElement('div');
                            ovr_2.className = "modal-content-popup";

                            var h3 = document.createElement("h3");
                            h3.innerText = "Выбор сертификата:";

                            ovr_2.appendChild(h3);

                            certificates.map((cert) => {
                                if (cert.isValid) {
                                    var child = document.createElement('p');
                                    child.innerText = cert.subjectSimpleName;
                                    child.className = "sign-option";
                                    child.onclick = function() {
                                        var promises = [],
                                            signs = data;
                                        // TODO: Add for arrays, not object
                                        for (var prop in signs) {
                                            promises.push(signHandler.doSign(cert, data[prop]));
                                        }
                                        Promise.all(promises).then(signatureData => {
                                            var i = 0;
                                            for (var prop in signs) {
                                                signs[prop] = signatureData[i];
                                                i++;
                                            }
                                            resolve(signs);
                                        }, error => {
                                            reject(error);
                                        });
                                        ovr.style.visibility = "hidden";
                                    };
                                    ovr_2.appendChild(child); // `<p onclick=${doSign(cert)}>${cert.subjectSimpleName}</p>`;
                                }
                            });

                            ovr_1.appendChild(ovr_2);
                            ovr.appendChild(ovr_1);

                            document.getElementsByTagName("Body")[0].appendChild(ovr);

                            ovr.style.visibility = "visible";
                        }
                    }).catch(err => {
                        reject(err);
                    });
                })
            },
            getErrorMessage: function(e) {
                var err = e.message;
                if (!err) {
                    err = e;
                } else if (e.number) {
                    err += " (0x" + this.decimalToHexString(e.number) + ")";
                }
                return err;
            },
            decimalToHexString: function(number) {
                if (number < 0) {
                    number = 0xFFFFFFFF + number + 1;
                }

                return number.toString(16).toUpperCase();
            },
            isPluginInstalled: function() {
                return new Promise(function(resolve, reject) {
                    var browserName = signHandler.returnBrowserName();
                    if ((browserName == 'Chrome') || (browserName == 'Opera')) {
                        var chrome_url = "chrome-extension://" + signConfig.chrome_crypto_extension_id + "/nmcades_plugin_api.js";
                        var opera_url = "chrome-extension://" + signConfig.opera_crypto_extension_id + "/nmcades_plugin_api.js";
                        // Проверяем установлен ли CryptoPro Extension for CAdES Browser Plug-in из Google Chrome Store
                        httpGet(chrome_url).then(function() {
                            resolve();
                        }, function() {
                            // TODO: add chrome inline plugin installation
                            var html_install_chrome_plugin = "<p>Вам необходимо обновить " +
                                "<a target=\'_blank\' href=\'https://chrome.google.com/webstore/detail/cryptopro-extension-for-c/iifchhfnnmpdbibifmljnfjhpififfog\'>плагин КриптоПро ЭЦП Browser</a> для подписания. " +
                                "<a target=\'_blank\' href=\'http://www.cryptopro.ru/products/cades/plugin\'>Подробнее</a></p>";
                            if (browserName == 'Opera') {
                                var html_install_opera_plugin = "";
                                var html_install_from_chrome = "<p>Проверьте плагин для добавления расширений из Chrome Store. " +
                                    "<a target=\'_blank\' href=\'https://addons.opera.com/ru/extensions/details/download-chrome-extension-9/?display=en\'>Установить</a></p>"; // для загрузки приложений google chrome store
                                // Теперь проверяем установлен ли CryptoPro Extension for CAdES Browser Plug-in в Опере
                                var operaLoadPluginPromise = httpGet(opera_url).then(function() {}, function() {
                                    // TODO: add opera inline plugin installation
                                    function install_opera_plugin(plugin_id) {
                                        opr.addons.installExtension(plugin_id, function() {
                                            console.log("success opr.addons.installExtension: " + plugin_id);
                                        }, function() {
                                            console.log("error opr.addons.installExtension: " + plugin_id);
                                        });
                                    }
                                    html_install_opera_plugin =
                                        "<p>Плагин подписания для Оперы не установлен. " +
                                        "<a target=\'_blank\' href=\'https://addons.opera.com/ru/extensions/details/cryptopro-extension-for-cades-browser-plug-in/?display=rus\'>Установить</a></p>";
                                });

                                operaLoadPluginPromise.finally(function() {
                                    reject(
                                        html_install_opera_plugin +
                                        html_install_from_chrome +
                                        html_install_chrome_plugin
                                    )
                                })
                            } else {
                                reject(html_install_chrome_plugin);
                            }
                        });
                    } else {
                        /* TODO: рассмотреть другие варианты браузеров */
                        resolve();
                    }
                });

            },
            returnBrowserName: function() {
                if (("Microsoft Internet Explorer" === window.navigator.appName) || // IE < 11
                    (null != window.navigator.userAgent.match(/Trident\/./i))) // IE11
                    return 'IE';

                var retVal_chrome = window.navigator.userAgent.match(/chrome/i);
                var isOpera = navigator.userAgent.match(/opr/i);

                if (retVal_chrome == null) {
                    // В Firefox работаем через NPAPI
                    return 'FF';
                } else {
                    // В Chrome и Opera работаем через асинхронную версию
                    if (isOpera != null) {
                        return 'Opera';
                    } else if (retVal_chrome.length > 0) {
                        return 'Chrome'
                    }
                }
                return false;
            }
        },
        httpGet = function(url) {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onload = function() {
                    if (this.status == 200) {
                        resolve(this.response);
                    } else {
                        var error = new Error(this.statusText);
                        error.code = this.status;
                        reject(error);
                    }
                };
                xhr.onerror = function() {
                    reject(new Error("Network Error"));
                };
                xhr.send();
            });
        },
        httpPost = function(url, send_model) {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

                xhr.onload = function() {
                    if (this.status == 200) {
                        resolve(this.response);
                    } else {
                        var error = new Error(this.statusText);
                        error.code = this.status;
                        reject(error);
                    }
                };

                xhr.onerror = function() {
                    reject(new Error("Network Error"));
                };

                xhr.send(JSON.stringify(send_model));
            })
        }

    return {
        doSign: signHandler.doSign,
        getCertificates: signHandler.getCertificates,
        isPluginInstalled: signHandler.isPluginInstalled,
        signData: signHandler.getSignTemplate,
        httpGet: httpGet,
        httpPost: httpPost,

        uploadModel: function(model) { return httpPost(urlConfig() + '/statement/upload', model) },
        uploadSign: function(sign_model) { return httpPost(urlConfig() + '/statement/uploadSign', sign_model) },
        finishPackage: function(params) { return httpPost(urlConfig() + '/statement/finish', params) },
        signStatement: function(model) {
            this.uploadModel(model)
                .then((data) => {
                    if (data) {
                        data = JSON.parse(data);
                    } else {
                        throw ('Неправильнй ответ сервера');
                    }
                    this.packageGuid = data.packageGuid;
                    this.statementGuid = data.statementGuid;
                    return this.signData(data.contentToSign);
                })
                .then((signature) => {
                    var uploadParams = {
                        packageGuid: this.packageGuid,
                        statementGuid: this.statementGuid,
                        signs: signature
                    };
                    return this.uploadSign(uploadParams)
                })
                .then((data) => {
                    var uploadParams = {
                        packageGuid: this.packageGuid,
                        esiaUserId: this.getEsiaUserId(),
                        subjectObject: ''
                    };
                    return this.finishPackage(uploadParams);
                })
                .then((data) => {
                    api.shade(false);
                    console.log("Result: " + JSON.stringify(data));

                    if (PGU && PGU.templates.get('Signers')) {
                        var $popup;
                        $.template('Signers', PGU.templates.get('Signers'));
                        $popup = $.tmpl('Signers', { 'resultId': data });
                        $popup.appendTo('body');
                        $popup.show();

                        $('#goToStatements').click(function() {
                            $popup.hide();
                        });
                    }
                })
                .catch((error) => {
                    api.shade(false);
                    error = error ? error : {};
                    if (error.hasOwnProperty('data') && error.data) {
                        error = error.data;
                    }
                    if (error.hasOwnProperty('message') && error.message) {
                        error = error.message;
                    } else if (error.hasOwnProperty('errorMessage')) {
                        error = error.errorMessage;
                    }
                    console.log(error || "Ошибка загрузки заявления");
                });
        },
        getEsiaUserId: function() { return sessionStorage.getItem('esiaUserId'); }
    };
})();