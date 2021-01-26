var http = require('http');
var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');
var d3 = require('d3');

const glob = require('glob');

var server_port = 42001;
var assigned_port = process.env.VIS_PORT;
if (assigned_port > 42000 && assigned_port < 43000) server_port = assigned_port;
// var exp_data_dir = process.env.EXP_DATA_DIR || "../data/default";
// fs.writeFileSync('dist/exp_data_dir', exp_data_dir, 'utf8');
app.server = require('http').createServer(app);
app.wss_connection = {};
app.folder = process.env.APP_DATA_FOLDER || process.cwd();
app.port = server_port;
// var getRan = d3.randomUniform(1, 100);

// function _getCSVs(t_dir, t_files, isexp=false) {
//     console.log(`getCSVs pars:\n${t_dir}\n${t_files}\n`);
//     let on_off_line = ["rl_offline", "rl_online"];
//     let is_test = ["sync_train", "train", "test"];
//     let is_exp = ["env/0","index0"];
//     let exp_path = isexp?is_exp[1]:is_exp[0];
//     let ret = [];
//     for (let j in on_off_line) {
//         for (k in is_test) {
//             try {
//                 let subDirs = glob.sync(t_dir + `/result/${on_off_line[j]}/${is_test[k]}/${exp_path}/*`);
//                 for (let i in subDirs) {
//                     let pass_test = true;
//                     for (let l in t_files) {
//                         if (!fs.existsSync(subDirs[i] + `/${t_files[l]}`)) {
//                             pass_test = false;
//                             break;
//                         }
//                     }
//                     if (pass_test)
//                         ret.push(subDirs[i]);
//                 }
//             }
//             catch (ex) {
//                 console.log(`getCSVs err\n${t_dir}\n${t_files}\n${ex}`);
//             }
//         }
//     }
//         return ret;
// }

const keepaliveAgent = new http.Agent({
    keepAlive: true
});

// var data_folder = app.folder + "/../../output/";

const static_folder = path.join(app.folder, "dist");
app.use(express.static(static_folder));

// app.get('/backend_test', function (req, res) {
//     var start_tick = req.query.s;
//     console.error('test' + start_tick);
//     res.send(start_tick + ":" + getRan() + ":" + (new Date()).toLocaleDateString());
// });

// app.get('/file_data', function (req, res) {
//     var start_tick = req.query.s;
//     fs.readdir(data_folder, function (err, files) {
//         if (err) {
//             res.sendStatus("500");
//             return console.error(err);
//         }
//         else {
//             let found = false;
//             files.forEach(function (file) {

//                 if (file.startsWith("ep") && file.endsWith(".csv")) {
//                     let fn_split = file.split('.');
//                     let file_ep = fn_split[0].substring(2);
//                     if (+file_ep == +start_tick) {
//                         //console.log(typeof (file), ":", file, " ep:", file_ep);
//                         found = true;
//                         res.status(200);
//                         // create read stream
//                         let readerStream = fs.createReadStream(data_folder + '/' + file);

//                         // set code utf8。
//                         readerStream.setEncoding('UTF8');

//                         // set data process event --> data, end, and error
//                         readerStream.on('data', function (chunk) {
//                             res.write(chunk);
//                         });

//                         readerStream.on('end', function () {
//                             res.end();
//                         });

//                         readerStream.on('error', function (err) {
//                             console.log(err.stack);
//                         });
//                     }

//                 }
//             });
//             if (!found) {
//                 res.sendStatus("404");
//             }

//         }
//     });

// });

// function _continue_query(table_svc, p_query, p_res, continue_token, p_array) {
//     if (continue_token) {
//         table_svc.queryEntities('ExpResultV4', p_query, continue_token, function (error, result, response) {
//             if (!error) {
//                 // query was successful
//                 result.entries.forEach(ent => {
//                     p_array.push(ent);
//                 });
//                 if (result.continuationToken) {
//                     _continue_query(table_svc, p_query, p_res, result.continuationToken, p_array)
//                 }
//                 else {
//                     p_res.send(JSON.stringify(p_array));
//                 }
//             }
//             else {
//                 console.log(error, result, response);
//                 res.sendStatus(500);
//             }
//         });
//     }
// }

// app.get('/ci_test_result', function (req, res) {
//     let resource_group = 'OOCL-CI-CPU-1';
//     if (req.query.rg) {
//         resource_group = req.query.rg;
//     }
//     var tableSvc = azure.createTableService('ooclsharestorage', 'CwxA/5/PAH0auHgNXj7ClgWO/nEn+Y0nIjRLvoUutHpmmzFOnESMUM5pzZ3EdMB9VJuTJscHB/lq5ndSoFzKrw==');
//     var query = new azure.TableQuery()
//         .where(`PartitionKey eq '${resource_group}'`)
//         ;
//     var res_array = []
//     tableSvc.queryEntities('ExpResultV4', query, null, function (error, result, response) {
//         if (!error) {
//             // query was successfulq
//             result.entries.forEach(ent => {
//                 res_array.push(ent);
//             });
//             if (result.continuationToken) {
//                 _continue_query(tableSvc, query, res, result.continuationToken, res_array)
//             }
//             else {
//                 res.send(JSON.stringify(res_array));
//             }
//         }
//         else {
//             console.log(error, result, response);
//             res.sendStatus(500);
//         }
//     });
// });

// app.get('/ci_test_dir', function (req, res) {
//     console.log(req.query);
//     let dir = "";
//     if (req.query.dir) {
//         dir = req.query.dir;
//     }
//     let files = [];
//     if (req.query.files) {
//         files = req.query.files.split(',');
//     }
//     let ret = _getCSVs(dir, files);
//     res.send(ret);

// });

// app.get('/ci_test_exp_dir', function (req, res) {
//     console.log(req.query);
//     let dir = "";
//     if (req.query.dir) {
//         dir = req.query.dir;
//     }
//     let files = [];
//     if (req.query.files) {
//         files = req.query.files.split(',');
//     }
//     let ret = _getCSVs(dir, files, isexp=true);
//     console.log(ret);
//     res.send(ret);

// });

// app.get('/ci_test_csv', function (req, res) {
//     console.log(req.query);
//     let t_file = "";
//     if (req.query.file) {
//         t_file = req.query.file;
//     }
//     let q_key = "";
//     if (req.query.q_key) {
//         q_key = req.query.q_key;
//     }
//     let q_value = "";
//     if (req.query.q_value) {
//         q_value = req.query.q_value;
//     }
//     try {

//         let csvdata = d3.csvParse(fs.readFileSync(t_file, 'utf8'));
//         if (csvdata) {
//             res.send(
//                 JSON.stringify(
//                 csvdata.filter(d => {
//                 return d[q_key] == q_value;
//             }))
//             );
//         }
//         else {
//             res.send("[]");
//         }
//     } catch (error) {
//         console.log(`getCSVs err\n${t_file}\n${q_key}\n${q_value}\n${error}`);
//         res.send("[]");
//     }


// });

app.server.listen(app.port, /* app.port */ function () {
    console.error('maro_vis listening at port %d', app.server.address().port);
});
