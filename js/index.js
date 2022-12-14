const MODEL_NAME = './model/model.json';
const LABELS_NAME = './skin_labels.txt';
const IMAGE_SIZE = 256;

async function init() {
    model = await tf.loadGraphModel(MODEL_NAME);
    labels = load_labels(LABELS_NAME).split('\r\n');
}

function load_labels(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
};

function loadImg() {
    const selectFile = document.getElementById('input').files[0];
    let reader = new FileReader();
    reader.onload = e => {
        let img = document.createElement('img');
        img.src = e.target.result;
        img.id = "outputImage";
        img.onload = () => {
            const showImage = document.getElementById('showImage');
            showImage.innerHTML = '';
            showImage.appendChild(img);
        }
    }
    reader.readAsDataURL(selectFile);
};

function submit() {
    let submitImage = document.getElementById('outputImage');
    predict(submitImage);
}

function findMaxIndex(result) {
    const arr = Array.from(result);
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > maxValue) {
            maxIndex = i;
            maxValue = arr[i]
        }
    }
    return { predNum: maxIndex, prob: maxValue };
}

function predict(imgElement) {
    const logits = tf.tidy(() => {
        const img = tf.cast(tf.browser.fromPixels(imgElement).resizeBilinear([IMAGE_SIZE, IMAGE_SIZE]), 'float32');
        const batched = img.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
        const pred = model.predict(batched);
        const result = pred.dataSync();

        for (let i = 0; i < yValues.length; i++) {
            yValues.splice(i, 1, result[i]);
        }

        var ctx = document.getElementById("Chart").getContext("2d");
        myChart.update()

        const { predNum, prob } = findMaxIndex(result);
        document.getElementById('resultValue').innerHTML = labels[predNum];
        if (labels[predNum] === "MEL" || labels[predNum] === "BCC" || labels[predNum] === "SCC") {
            document.getElementById('resultRemind').innerHTML = "<??????????????????????????????  ????????????????????????????????????????????????????????????>";
        }
        else {
            document.getElementById('resultRemind').innerHTML = "<?????????????????????????????????  ???????????????  ???????????????????????????????????????>";
        }

        var myCarousel = document.querySelector('#carouselForDisease')
        var carousel = new bootstrap.Carousel(myCarousel)
        for (let i = 0; i < 8; i++) {
            if (predNum === i) {
                carousel.to(i)
            }
        }
    });
}


var xValues = load_labels(LABELS_NAME).split('\r\n');
let yValues = [0, 0, 0, 0, 0, 0, 0, 0];
var barColors = ["#524845", "#a69b8f", "#694e30", "#8f747e", "#a88f59", "#d1bfb6", "#ad7f9d", "#b8655c"];

let myChart = new Chart("Chart", {
    type: "bar",
    data: {
        labels: xValues,
        datasets: [{
            backgroundColor: barColors,
            data: yValues
        }]
    },
    options: {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: "????????????"
        },
        scales: {
            yAxes: [{
                ticks: {
                    min: 0
                }
            }]
        }
    }
});


$(document).ready(function () {
    $('#myTable').DataTable({
        "ajax": './data.json',
        "columns": [ //????????????????????????DOM??????????????????????????????????????????????????????????????????)
            { data: '??????????????????', title: '??????????????????' },
            { data: '??????', title: '??????' },
            { data: '????????????', title: '????????????' },
            { data: '??????', title: '??????' },
        ],

        initComplete: function () {
            this.api()
                .columns()
                .every(function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex($(this).val());

                            column.search(val ? '^' + val + '$' : '', true, false).draw();
                        });

                    column
                        .data()
                        .unique()
                        .sort()
                        .each(function (d, j) {
                            select.append('<option value="' + d + '">' + d + '</option>');
                        });
                });
        },
    })


});