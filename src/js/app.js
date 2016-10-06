var getCert = function getInstalledCertificatesAsync() {

    getCert.certs = getCert.certs || [];

    if (getCert.certs.lenght > 0) {
        return getCert.certs;
    }

    return new Promise(function(resolve, reject) {
        cadesplugin.async_spawn(function*(args) {
            getCert.certs = [];
            try {
                var oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.Store");

                yield oStore.Open(cadesplugin.CAPICOM_CURRENT_USER_STORE, cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);

                var oCertificates = yield oStore.Certificates;
                var Count = yield oCertificates.Count;

                var i;
                for (i = 0; i < Count; i++) {
                    var cert = yield oCertificates.Item(i + 1);
                    getCert.certs.push({
                        id: i,
                        subjectSimpleName: yield cert.GetInfo(cadesplugin.CAPICOM_CERT_INFO_SUBJECT_SIMPLE_NAME),
                        issuerSimpleName: yield cert.GetInfo(cadesplugin.CAPICOM_CERT_INFO_ISSUER_SIMPLE_NAME),
                        validFrom: yield cert.ValidFromDate,
                        validTo: yield cert.ValidToDate,
                        cert: cert
                    });
                }
                yield oStore.Close();
                args[0](getCert.certs);
            } catch (e) {
                args[1](e);
            }
        }, resolve, reject);
    });
};



// =====








// =====




var click = function(ev) {






    getCert()
        .then(function(certs) {

            return fetch('/data/clear/upload.json');

        })
        .then((resp) => resp.json())
        .then(function(res) {
 
            // var data = new FormData();
            // data.append("json", JSON.stringify(res));
            var data = JSON.stringify(res);

            return fetch('http://localhost:5050/res.arm.request.grp//statement/upload', {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'x-www-form-urlencoded'
                }
            });
        })
        .then((resp) => resp.json())
        .then(function(res) {
            // получаем сертификат
            var _c = getCert.certs[0];

            var text = "PGh0bWw+PGhlYWQ+PG1ldGEgaHR0cC1lcXVpdj1Db250ZW50LVR5cGUgY29udGVudD0idGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04Ij48L2hlYWQ+PGJvZHk+PGRpdj48c3BhbiBzdHlsZT0iZm9udC13ZWlnaHQ6IGJvbGQiPtCm0LXQu9GMINC+0LHRgNCw0YnQtdC90LjRjzo8L3NwYW4+INCf0YDQtdC00L7RgdGC0LDQstC70LXQvdC40LUg0LrQvtC/0LjQuCDQtNC+0LrRg9C80LXQvdGC0LAsINC90LAg0L7RgdC90L7QstCw0L3QuNC4INC60L7RgtC+0YDQvtCz0L4g0YHQstC10LTQtdC90LjRjyDQvtCxINC+0LHRitC10LrRgtC1INC90LXQtNCy0LjQttC40LzQvtGB0YLQuCDQstC90LXRgdC10L3RiyDQsiDQk9C+0YHRg9C00LDRgNGB0YLQstC10L3QvdGL0Lkg0LrQsNC00LDRgdGC0YAg0L3QtdC00LLQuNC20LjQvNC+0YHRgtC4PC9kaXY+PCEtLSBuZ1JlcGVhdDogKGtleSwgdmFsKSBpbiBDdHJsLnN0ZXBzIC0tPjxkaXYgY2xhc3M9Imdyb3VwIG5nLXNjb3BlIiBuZy1yZXBlYXQ9IihrZXksIHZhbCkgaW4gQ3RybC5zdGVwcyI+PGRpdiBjbGFzcz0iZ3JvdXAtdGl0bGUgbmctYmluZGluZyI+0JTQsNC90L3Ri9C1INC+0LEg0L7QsdGK0LXQutGC0LU6PC9kaXY+PGRpdiBjbGFzcz0iZ3JvdXAtY29udGVudCI+PCEtLSBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48ZGl2IGNsYXNzPSJpbnB1dC1ibG9jayBuZy1zY29wZSIgbmctaWY9IkN0cmwuZyhrKSAmYW1wOyZhbXA7IEN0cmwubihrLCBDdHJsLmcoaykpIiBuZy1yZXBlYXQ9IihrLCB2KSBpbiB2YWwiPjxzcGFuIGNsYXNzPSJsYWJlbCBuZy1iaW5kaW5nIj7QktC40LQ6PC9zcGFuPjxzcGFuIGNsYXNzPSJ0ZXh0IG5nLWJpbmRpbmciPtCX0LXQvNC10LvRjNC90YvQuSDRg9GH0LDRgdGC0L7Qujwvc3Bhbj48L2Rpdj48IS0tIGVuZCBuZ0lmOiBDdHJsLmcoaykgJiYgQ3RybC5uKGssIEN0cmwuZyhrKSkgLS0+PCEtLSBlbmQgbmdSZXBlYXQ6IChrLCB2KSBpbiB2YWwgLS0+PCEtLSBuZ0lmOiBDdHJsLmcoaykgJiYgQ3RybC5uKGssIEN0cmwuZyhrKSkgLS0+PGRpdiBjbGFzcz0iaW5wdXQtYmxvY2sgbmctc2NvcGUiIG5nLWlmPSJDdHJsLmcoaykgJmFtcDsmYW1wOyBDdHJsLm4oaywgQ3RybC5nKGspKSIgbmctcmVwZWF0PSIoaywgdikgaW4gdmFsIj48c3BhbiBjbGFzcz0ibGFiZWwgbmctYmluZGluZyI+0JrQsNC00LDRgdGC0YDQvtCy0YvQuSDQvdC+0LzQtdGAOjwvc3Bhbj48c3BhbiBjbGFzcz0idGV4dCBuZy1iaW5kaW5nIj4zOTowMDowMDAwMDA6MzE8L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwhLS0gbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjxkaXYgY2xhc3M9ImlucHV0LWJsb2NrIG5nLXNjb3BlIiBuZy1pZj0iQ3RybC5nKGspICZhbXA7JmFtcDsgQ3RybC5uKGssIEN0cmwuZyhrKSkiIG5nLXJlcGVhdD0iKGssIHYpIGluIHZhbCI+PHNwYW4gY2xhc3M9ImxhYmVsIG5nLWJpbmRpbmciPtCf0LvQvtGJ0LDQtNGMOjwvc3Bhbj48c3BhbiBjbGFzcz0idGV4dCBuZy1iaW5kaW5nIj41MDA8L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwhLS0gbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjxkaXYgY2xhc3M9ImlucHV0LWJsb2NrIG5nLXNjb3BlIiBuZy1pZj0iQ3RybC5nKGspICZhbXA7JmFtcDsgQ3RybC5uKGssIEN0cmwuZyhrKSkiIG5nLXJlcGVhdD0iKGssIHYpIGluIHZhbCI+PHNwYW4gY2xhc3M9ImxhYmVsIG5nLWJpbmRpbmciPtCQ0LTRgNC10YEgKNC80LXRgdGC0L7Qv9C+0LvQvtC20LXQvdC40LUpOjwvc3Bhbj48c3BhbiBjbGFzcz0idGV4dCBuZy1iaW5kaW5nIj7QmtCw0LvQuNC90LjQvdCz0YDQsNC00YHQutCw0Y8g0L7QsdC70LDRgdGC0YwsINGALdC9INCX0LXQu9C10L3QvtCz0YDQsNC00YHQutC40LksINC/INCf0L7QtNC+0YDQvtC20L3QvtC1PC9zcGFuPjwvZGl2PjwhLS0gZW5kIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48L2Rpdj48L2Rpdj48IS0tIGVuZCBuZ1JlcGVhdDogKGtleSwgdmFsKSBpbiBDdHJsLnN0ZXBzIC0tPjxkaXYgY2xhc3M9Imdyb3VwIG5nLXNjb3BlIiBuZy1yZXBlYXQ9IihrZXksIHZhbCkgaW4gQ3RybC5zdGVwcyI+PGRpdiBjbGFzcz0iZ3JvdXAtdGl0bGUgbmctYmluZGluZyI+0JTQsNC90L3Ri9C1INC+INC00L7QutGD0LzQtdC90YLQtTo8L2Rpdj48ZGl2IGNsYXNzPSJncm91cC1jb250ZW50Ij48IS0tIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwhLS0gbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjxkaXYgY2xhc3M9ImlucHV0LWJsb2NrIG5nLXNjb3BlIiBuZy1pZj0iQ3RybC5nKGspICZhbXA7JmFtcDsgQ3RybC5uKGssIEN0cmwuZyhrKSkiIG5nLXJlcGVhdD0iKGssIHYpIGluIHZhbCI+PHNwYW4gY2xhc3M9ImxhYmVsIG5nLWJpbmRpbmciPtCi0LjQvyDQt9Cw0L/RgNCw0YjQuNCy0LDQtdC80L7Qs9C+INC00L7QutGD0LzQtdC90YLQsDo8L3NwYW4+PHNwYW4gY2xhc3M9InRleHQgbmctYmluZGluZyI+0JzQtdC20LXQstC+0Lkg0L/Qu9Cw0L08L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwhLS0gbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjxkaXYgY2xhc3M9ImlucHV0LWJsb2NrIG5nLXNjb3BlIiBuZy1pZj0iQ3RybC5nKGspICZhbXA7JmFtcDsgQ3RybC5uKGssIEN0cmwuZyhrKSkiIG5nLXJlcGVhdD0iKGssIHYpIGluIHZhbCI+PHNwYW4gY2xhc3M9ImxhYmVsIG5nLWJpbmRpbmciPtCd0L7QvNC10YA6PC9zcGFuPjxzcGFuIGNsYXNzPSJ0ZXh0IG5nLWJpbmRpbmciPjE8L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwhLS0gbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjxkaXYgY2xhc3M9ImlucHV0LWJsb2NrIG5nLXNjb3BlIiBuZy1pZj0iQ3RybC5nKGspICZhbXA7JmFtcDsgQ3RybC5uKGssIEN0cmwuZyhrKSkiIG5nLXJlcGVhdD0iKGssIHYpIGluIHZhbCI+PHNwYW4gY2xhc3M9ImxhYmVsIG5nLWJpbmRpbmciPtCU0LDRgtCwINCy0YvQtNCw0YfQuDo8L3NwYW4+PHNwYW4gY2xhc3M9InRleHQgbmctYmluZGluZyI+MDUuMTAuMjAxNjwvc3Bhbj48L2Rpdj48IS0tIGVuZCBuZ0lmOiBDdHJsLmcoaykgJiYgQ3RybC5uKGssIEN0cmwuZyhrKSkgLS0+PCEtLSBlbmQgbmdSZXBlYXQ6IChrLCB2KSBpbiB2YWwgLS0+PC9kaXY+PC9kaXY+PCEtLSBlbmQgbmdSZXBlYXQ6IChrZXksIHZhbCkgaW4gQ3RybC5zdGVwcyAtLT48ZGl2IGNsYXNzPSJncm91cCBuZy1zY29wZSIgbmctcmVwZWF0PSIoa2V5LCB2YWwpIGluIEN0cmwuc3RlcHMiPjxkaXYgY2xhc3M9Imdyb3VwLXRpdGxlIG5nLWJpbmRpbmciPtCh0LLQtdC00LXQvdC40Y8g0L4g0LfQsNGP0LLQuNGC0LXQu9C1OjwvZGl2PjxkaXYgY2xhc3M9Imdyb3VwLWNvbnRlbnQiPjwhLS0gbmdSZXBlYXQ6IChrLCB2KSBpbiB2YWwgLS0+PCEtLSBuZ0lmOiBDdHJsLmcoaykgJiYgQ3RybC5uKGssIEN0cmwuZyhrKSkgLS0+PGRpdiBjbGFzcz0iaW5wdXQtYmxvY2sgbmctc2NvcGUiIG5nLWlmPSJDdHJsLmcoaykgJmFtcDsmYW1wOyBDdHJsLm4oaywgQ3RybC5nKGspKSIgbmctcmVwZWF0PSIoaywgdikgaW4gdmFsIj48c3BhbiBjbGFzcz0ibGFiZWwgbmctYmluZGluZyI+0KTQsNC80LjQu9C40Y86PC9zcGFuPjxzcGFuIGNsYXNzPSJ0ZXh0IG5nLWJpbmRpbmciPtCT0YPRgdC80LDQvdC+0LI8L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwhLS0gbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjxkaXYgY2xhc3M9ImlucHV0LWJsb2NrIG5nLXNjb3BlIiBuZy1pZj0iQ3RybC5nKGspICZhbXA7JmFtcDsgQ3RybC5uKGssIEN0cmwuZyhrKSkiIG5nLXJlcGVhdD0iKGssIHYpIGluIHZhbCI+PHNwYW4gY2xhc3M9ImxhYmVsIG5nLWJpbmRpbmciPtCY0LzRjzo8L3NwYW4+PHNwYW4gY2xhc3M9InRleHQgbmctYmluZGluZyI+0JjQu9GM0YjQsNGCPC9zcGFuPjwvZGl2PjwhLS0gZW5kIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48ZGl2IGNsYXNzPSJpbnB1dC1ibG9jayBuZy1zY29wZSIgbmctaWY9IkN0cmwuZyhrKSAmYW1wOyZhbXA7IEN0cmwubihrLCBDdHJsLmcoaykpIiBuZy1yZXBlYXQ9IihrLCB2KSBpbiB2YWwiPjxzcGFuIGNsYXNzPSJsYWJlbCBuZy1iaW5kaW5nIj7QntGC0YfQtdGB0YLQstC+Ojwvc3Bhbj48c3BhbiBjbGFzcz0idGV4dCBuZy1iaW5kaW5nIj7QpdCw0LzQuNGB0L7QstC40Yc8L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwhLS0gbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjxkaXYgY2xhc3M9ImlucHV0LWJsb2NrIG5nLXNjb3BlIiBuZy1pZj0iQ3RybC5nKGspICZhbXA7JmFtcDsgQ3RybC5uKGssIEN0cmwuZyhrKSkiIG5nLXJlcGVhdD0iKGssIHYpIGluIHZhbCI+PHNwYW4gY2xhc3M9ImxhYmVsIG5nLWJpbmRpbmciPtCU0LDRgtCwINGA0L7QttC00LXQvdC40Y86PC9zcGFuPjxzcGFuIGNsYXNzPSJ0ZXh0IG5nLWJpbmRpbmciPjA3LjA3LjE5ODY8L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwhLS0gbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjxkaXYgY2xhc3M9ImlucHV0LWJsb2NrIG5nLXNjb3BlIiBuZy1pZj0iQ3RybC5nKGspICZhbXA7JmFtcDsgQ3RybC5uKGssIEN0cmwuZyhrKSkiIG5nLXJlcGVhdD0iKGssIHYpIGluIHZhbCI+PHNwYW4gY2xhc3M9ImxhYmVsIG5nLWJpbmRpbmciPtCh0J3QmNCb0KE6PC9zcGFuPjxzcGFuIGNsYXNzPSJ0ZXh0IG5nLWJpbmRpbmciPjEwNC00MDgtMzU3IDE4PC9zcGFuPjwvZGl2PjwhLS0gZW5kIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48ZGl2IGNsYXNzPSJpbnB1dC1ibG9jayBuZy1zY29wZSIgbmctaWY9IkN0cmwuZyhrKSAmYW1wOyZhbXA7IEN0cmwubihrLCBDdHJsLmcoaykpIiBuZy1yZXBlYXQ9IihrLCB2KSBpbiB2YWwiPjxzcGFuIGNsYXNzPSJsYWJlbCBuZy1iaW5kaW5nIj7QkNC00YDQtdGBOjwvc3Bhbj48c3BhbiBjbGFzcz0idGV4dCBuZy1iaW5kaW5nIj7Qsy4g0JzQvtGB0LrQstCwINGD0LsuINCb0LDQt9C+INC0LiAxINC6LiAxINGB0YLRgC4gMSDQutCyLiAxPC9zcGFuPjwvZGl2PjwhLS0gZW5kIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48IS0tIGVuZCBuZ1JlcGVhdDogKGssIHYpIGluIHZhbCAtLT48IS0tIG5nSWY6IEN0cmwuZyhrKSAmJiBDdHJsLm4oaywgQ3RybC5nKGspKSAtLT48ZGl2IGNsYXNzPSJpbnB1dC1ibG9jayBuZy1zY29wZSIgbmctaWY9IkN0cmwuZyhrKSAmYW1wOyZhbXA7IEN0cmwubihrLCBDdHJsLmcoaykpIiBuZy1yZXBlYXQ9IihrLCB2KSBpbiB2YWwiPjxzcGFuIGNsYXNzPSJsYWJlbCBuZy1iaW5kaW5nIj5FbWFpbDo8L3NwYW4+PHNwYW4gY2xhc3M9InRleHQgbmctYmluZGluZyI+Z3VzbWFub3Yud29ya0B5YW5kZXgucnU8L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwvZGl2PjwvZGl2PjwhLS0gZW5kIG5nUmVwZWF0OiAoa2V5LCB2YWwpIGluIEN0cmwuc3RlcHMgLS0+PGRpdiBjbGFzcz0iZ3JvdXAgbmctc2NvcGUiIG5nLXJlcGVhdD0iKGtleSwgdmFsKSBpbiBDdHJsLnN0ZXBzIj48ZGl2IGNsYXNzPSJncm91cC10aXRsZSBuZy1iaW5kaW5nIj7QodC/0L7RgdC+0LEg0L/RgNC10LTQvtGB0YLQsNCy0LvQtdC90LjRjyDRgdCy0LXQtNC10L3QuNC5OjwvZGl2PjxkaXYgY2xhc3M9Imdyb3VwLWNvbnRlbnQiPjwhLS0gbmdSZXBlYXQ6IChrLCB2KSBpbiB2YWwgLS0+PCEtLSBuZ0lmOiBDdHJsLmcoaykgJiYgQ3RybC5uKGssIEN0cmwuZyhrKSkgLS0+PGRpdiBjbGFzcz0iaW5wdXQtYmxvY2sgbmctc2NvcGUiIG5nLWlmPSJDdHJsLmcoaykgJmFtcDsmYW1wOyBDdHJsLm4oaywgQ3RybC5nKGspKSIgbmctcmVwZWF0PSIoaywgdikgaW4gdmFsIj48c3BhbiBjbGFzcz0ibGFiZWwgbmctYmluZGluZyI+0JIg0LLQuNC00LUg0YHRgdGL0LvQutC4INC90LAg0Y3Qu9C10LrRgtGA0L7QvdC90YvQuSDQtNC+0LrRg9C80LXQvdGCINC/0L4g0LDQtNGA0LXRgdGDINGN0LvQtdC60YLRgNC+0L3QvdC+0Lkg0L/QvtGH0YLRizo8L3NwYW4+PHNwYW4gY2xhc3M9InRleHQgbmctYmluZGluZyI+Z3VzbWFub3Yud29ya0B5YW5kZXgucnU8L3NwYW4+PC9kaXY+PCEtLSBlbmQgbmdJZjogQ3RybC5nKGspICYmIEN0cmwubihrLCBDdHJsLmcoaykpIC0tPjwhLS0gZW5kIG5nUmVwZWF0OiAoaywgdikgaW4gdmFsIC0tPjwvZGl2PjwvZGl2PjwhLS0gZW5kIG5nUmVwZWF0OiAoa2V5LCB2YWwpIGluIEN0cmwuc3RlcHMgLS0+PCEtLSBuZ0lmOiBDdHJsLmF0dGFjaG1lbnRzICYmIEN0cmwuYXR0YWNobWVudHMubGVuZ3RoIC0tPjxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OiBib2xkIj48L2Rpdj48c3R5bGU+Lmdyb3VwIHsgZGlzcGxheTpibG9jazsgbWFyZ2luLXRvcDoyMHB4OyBtYXJnaW4tYm90dG9tOjIwcHg7fSAuZ3JvdXAgLmdyb3VwLXRpdGxlIHtmb250LXdlaWdodDogYm9sZDsgbWFyZ2luLWJvdHRvbTo1cHg7IH0gLmdyb3VwIC5pbnB1dC1ibG9jayB7IGRpc3BsYXk6IHRhYmxlOyB3aWR0aDogMTAwJTsgbWF4LXdpZHRoOiA5MDBweDt9IC5ncm91cCAuaW5wdXQtYmxvY2sgLmxhYmVsLCAuZ3JvdXAgLmlucHV0LWJsb2NrIC50ZXh0IHsgZGlzcGxheTogdGFibGUtY2VsbDsgdGV4dC1hbGlnbjpsZWZ0OyBwYWRkaW5nLWJvdHRvbTogNXB4O30gLmdyb3VwIC5pbnB1dC1ibG9jayAubGFiZWwgeyB3aWR0aDozMCU7IHBhZGRpbmctcmlnaHQ6IDIwcHg7fSAuZ3JvdXAgLmlucHV0LWJsb2NrIC50ZXh0IHsgZm9udC13ZWlnaHQ6IGJvbGQ7fSAuZ3JvdXAgLmdyb3VwLWNvbnRlbnQgLnJvdyB7IGRpc3BsYXk6IHRhYmxlOyB3aWR0aDogMTAwJTsgbWF4LXdpZHRoOiA5MDBweDt9IC5ncm91cCAuZ3JvdXAtY29udGVudCAucm93IC5sZWZ0LWNvbHVtbiwgLmdyb3VwIC5ncm91cC1jb250ZW50IC5yb3cgLnJpZ2h0LWNvbHVtbiB7IGRpc3BsYXk6IHRhYmxlLWNlbGw7IHRleHQtYWxpZ246bGVmdDsgcGFkZGluZy1ib3R0b206IDVweDsgfSAuZ3JvdXAgLmdyb3VwLWNvbnRlbnQgLnJvdyAubGVmdC1jb2x1bW4geyAgd2lkdGg6MzAlOyBwYWRkaW5nLXJpZ2h0OiAyMHB4O30gLmdyb3VwIC5ncm91cC1jb250ZW50IC5yb3cgLnJpZ2h0LWNvbHVtbiB7IGZvbnQtd2VpZ2h0OiBib2xkO30gLmdyb3VwIC5ncm91cC1jb250ZW50IHRhYmxlIHsgd2lkdGg6MTAwJTsgbWF4LXdpZHRoOiA5MDBweDt9IC5ncm91cCAuZ3JvdXAtY29udGVudCB0YWJsZSB0aCwgLmdyb3VwIC5ncm91cC1jb250ZW50IHRhYmxlIHRkIHsgdGV4dC1hbGlnbjpsZWZ0OyBwYWRkaW5nLXJpZ2h0OjIwcHg7fTwvc3R5bGU+PC9ib2R5PjwvaHRtbD4=";

            // подписываем данные 
            return Common_SignCadesBES(_c, text); 
            // return SignatureService.doSign(_c, text);
        })
        .then(function(res){
            // формируем json
            // отправляем на сервер
            debugger;
        })
        .catch(function(err) {
            
            console.error(err);
        });
};



document.getElementById('sig-btn').addEventListener('click', click, false);