var CADESCOM_CADES_BES = 1;
var CAPICOM_CURRENT_USER_STORE = 2;
var CAPICOM_MY_STORE = "My";
var CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;
var CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME = 1;

function GetErrorMessage(e) {
    var err = e.message;
    if (!err) {
        err = e;
    } else if (e.number) {
        err += " (" + e.number + ")";
    }
    return err;
}


function signCreate(certificate, dataToSign) {
    if (!!cadesplugin.CreateObjectAsync) {
        return SignCreateAsync(certificate, dataToSign);
    } else {
        return new Promise(function(resolve, reject){
            resolve(signCreateSync(certificate, dataToSign)); 
        }); 
    }
}


function SignCreateAsync(certificate, dataToSign) {
    return new Promise(function(resolve, reject) {
        cadesplugin.async_spawn(function*(args) {
            try {
                var i, Signed = [];
                var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
                yield oSigner.propset_Certificate(certificate);

                var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");

                // (1/2 изменения для подписи КИ)
                yield oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY); //  1; //CADESCOM_BASE64_TO_BINARY

                for (i = 0; i < dataToSign.length; i++) {
                    yield oSignedData.propset_Content(dataToSign[i]);
                    // (2/2 изменения для подписи КИ)
                    //Signed.push(yield oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES));
                    Signed.push(yield oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES, true, 0));
                }
                args[2](Signed);
            } catch (e) {
                args[3](e);
            }
        }, certificate, dataToSign, resolve, reject);
    });
}

function signCreateSync(certificate, dataToSign) {
    var i;
    var Signatures = [];
    var CADES_BES = 1;
    var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    oSigner.Certificate = certificate;
    var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");

    // (1/2 изменения для подписи КИ)
    oSignedData.ContentEncoding = cadesplugin.CADESCOM_BASE64_TO_BINARY; //  1; //CADESCOM_BASE64_TO_BINARY

    for (i = 0; i < dataToSign.length; i++) {
        oSignedData.Content = dataToSign[i];
        // (2/2 изменения для подписи КИ)
        // Signatures.push(oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES));
        Signatures.push(oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES, true, 0));
    }
    return Signatures;
}


function signCreateSync(certificate, dataToSign) {
    var i;
    var Signatures = [];
    var CADES_BES = 1;
    var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    oSigner.Certificate = certificate;
    var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");

    // (1/2 изменения для подписи КИ)
    oSignedData.ContentEncoding = cadesplugin.CADESCOM_BASE64_TO_BINARY; //  1; //CADESCOM_BASE64_TO_BINARY

    for (i = 0; i < dataToSign.length; i++) {
        oSignedData.Content = dataToSign[i];
        // (2/2 изменения для подписи КИ)
        // Signatures.push(oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES));
        Signatures.push(oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES, true, 0));
    }
    return Signatures;
}



function run() {
    var oCertName = document.getElementById("CertName");
    var sCertName = oCertName.value;
    if ("" == sCertName) {
        alert("Введите имя сертификата (CN).");
        return;
    }
    var thenable = SignCreate(sCertName, "Message");

    thenable.then(
        function(result) {
            document.getElementById("signature").innerHTML = result;
        },
        function(result) {
            document.getElementById("signature").innerHTML = result;
        });
}