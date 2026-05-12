const { response } = require('express');
const Usuario = require('../models/usuario');
const Profile = require('../models/profile');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

const crearUsuarios = async(req, res = response) => {

    const { email, password } = req.body;

    const body = req.body;

    //emvio por correo
    var admin_email = req.body.admin_email;
    var newUser = new Usuario();
    newUser.username = req.body.username;
    newUser.user_email = req.body.email;
    newUser.timezone = req.body.timezone;
    //emvio por correo
    try {

        const existeEmail = await Usuario.findOne({ email });

        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            })
        }

        const usuario = new Usuario({
            username: body.username,
            email: body.email,
            terminos: body.terminos,
            role: body.role,
        });

        //encriptar password
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        //guardar usuario
        await usuario.save();

        //generar el token - JWT
        const token = await generarJWT(usuario.id);


        //emvio por correo
        // dispatch_emails(req.body);
        // usuario.password = undefined;
        // return res.json(usuario);
        //emvio por correo

        res.json({
            ok: true,
            usuario,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado... revisar logs'
        });
    }


};
//emvio por correo
function dispatch_emails(req, res) {

    let body = req.body;

    const transporter = nodemailer.createTransport({
        host: process.env.HOST_EMAIL,
        port: process.env.PORT_EMAIL,
        auth: {
            user: process.env.EMAIL_BACKEND,
            pass: process.env.PASSWORD_EMAIL
        },
        secureConnection: 'false',
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_BACKEND,
        to: req.body.email,
        subject: 'Account Registration Successful!',
        html: '<h3>Attention,' + username + ' , </h3><p><h3>Your Account has been successfully setup.</h3></p><p> Please allow a maximum of 24 - 48 Hours for Review and succesful setup and approval of your online account.</p></br>Regards,</br> Online Services.'
    };

    const AdminNotifyEmail = {
        from: process.env.EMAIL_BACKEND,
        to: body.admin_email,
        subject: 'Account Registration for ' + user_email + ', with username : ' + username + ' (' + username + ')',
        html: '<h3>Attention Admin , </h3><p>A new User has registered his Access with the following Information: </br> <strong>Username : ' + user_email + '</strong></br><strong>Company Name : ' + username + '</strong></br><strong>Date of Registration : ' + Date.Now + '</strong></p>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
        // if (error) throw error;
        // return res.send({ error: false, data: info, message: 'OK' });
        if (error) {
            return res.json({
                ok: false,
                msg: error
            });
        };

        return res.json({
            ok: true,
            msg: info
        })
    })

    transporter.sendMail(AdminNotifyEmail, function(error, info) {
        // if (error) throw error;
        // return res.send({ error: false, data: info, message: 'OK' });
        if (error) {
            return res.json({
                ok: false,
                msg: error
            });
        };

        return res.json({
            ok: true,
            msg: info
        })
    })

}
//emvio por correo

const getUsuariosList = async(req, res) => {

    // const desde = Number(req.query.desde) || 0;

    // const [usuarios, total] = await Promise.all([
    //     Usuario
    //     .find({}, 'username email role google') //esto ultimo filtra el resultado
    //     .skip(desde)
    //     .populate('profile')
    //     .limit(5), //pagina el resultado

    //     Usuario.countDocuments() //cuenta el total
    // ]);

    // res.json({
    //     ok: true,
    //     usuarios,
    //     total,
    //     //uid: req.uid
    // });

    const usuarios = await Usuario.find({})
        .populate('pago')
        .populate('blog')
        .populate('subcription')
        .populate('profile');

    res.json({
        ok: true,
        usuarios
    });



};

const getAllUsers = async(req, res) => {

    // const usuarios = await Usuario.find({})
    //     .populate('profile', 'first_name last_name pais estado ciudad telhome');

    // res.json({
    //     ok: true,
    //     usuarios
    // });
    const usuarios = await Usuario.find({});

    res.json({
        ok: true,
        usuarios
    });
};

const getUsuario = async(req, res = response) => {

    const id = req.params.id;

    try {

        const usuario = await Usuario.findById(id)
            .populate('username email role terminos google')

        res.json({
            ok: true,
            usuario: usuario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });

    }



};


const actualizarUAdmin = async(req, res = response) => {
    //todo: validar token y comprobar si el usuario es correcto

    const uid = req.params.id;

    try {
        const usuarioDB = await Usuario.findById(uid);
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el usuario por ese id'
            });
        }

        //actualizaciones
        const { password, google, email,  ...campos } = req.body;


        

        if (usuarioDB.email !== email) {

            const existeEmail = await Usuario.findOne({ email });
            if (existeEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con ese email'
                });
            }
        }

        if (!usuarioDB.google) {

            campos.email = email;

        } else if (usuarioDB.email !== email) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario de google no puede cambiar su correo'
            });
        }

        //encriptar password
        const salt = bcrypt.genSaltSync();
        usuarioDB.password = bcrypt.hashSync(password, salt);
            
        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, campos, { new: true });

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
};

const actualizarUsuario = async(req, res = response) => {
    //todo: validar token y comprobar si el usuario es correcto

    const uid = req.params.id;

    try {
        const usuarioDB = await Usuario.findById(uid);
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el usuario por ese id'
            });
        }

        //actualizaciones
        const { password, google, email, ...campos } = req.body;


        if (usuarioDB.email !== email) {

            const existeEmail = await Usuario.findOne({ email });
            if (existeEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con ese email'
                });
            }
        }

        if (!usuarioDB.google) {

            campos.email = email;

        } else if (usuarioDB.email !== email) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario de google no puede cambiar su correo'
            });
        }
        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, campos, { new: true });

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
};

const borrarUsuario = async(req, res) => {

    const uid = req.params.id;

    try {

        const usuarioDB = await Usuario.findById(uid);
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el usuario por ese id'
            });
        }

        await Usuario.findByIdAndDelete(uid);

        res.json({
            ok: true,
            msg: 'Usuario eliminado'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
};

const crearEditor = async(req, res = response) => {

    const { email, password } = req.body;

    const body = req.body;

    try {

        const existeEmail = await Usuario.findOne({ email });

        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            })
        }

        const usuario = new Usuario({
            username: body.username,
            email: body.email,
            role: 'EDITOR',
        });

        //encriptar password
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        //guardar usuario
        await usuario.save();

        //generar el token - JWT
        const token = await generarJWT(usuario.id);

        res.json({
            ok: true,
            usuario,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado... revisar logs'
        });
    }


};

const getAllEditores = (req, res) => {


    Usuario.find({ role: 'EDITOR' }).exec((err, editores) => {
        if (err) {
            res.status(500).send({ message: 'Ocurrió un error en el servidor.' });
        } else {
            if (editores) {
                res.status(200).send({ editores: editores });
            } else {
                res.status(500).send({ message: 'No se encontró ningun dato en esta sección.' });
            }
        }
    });
};

function set_token_recovery(req, res) {
    var email = req.params['email'];
    const token = Math.floor(Math.random() * (999999 - 100000) + 100000);


    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'mercadocreativo@gmail.com ',
            pass: 'brcgdrbbddkmuxhk'
        }
    }));

    var mailOptions = {
        from: 'mercadocreativo@gmail.com',
        to: email,
        subject: 'Código de recuperación.',
        text: 'Tu código de recuperacion es: ' + token
    };


    Usuario.findOne({ email: email }, (err, user) => {

        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } else {
            if (user == null) {
                res.status(500).send({ message: "El correo electrónico no se encuentra registrado, intente nuevamente." });
            } else {
                Usuario.findByIdAndUpdate({ _id: user._id }, { recovery_token: token }, (err, user_update) => {
                    if (err) {

                    } else {
                        res.status(200).send({ data: user_update });

                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {

                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                })
            }
        }
    });
}

function verify_token_recovery(req, res) {
    var email = req.params['email'];
    var codigo = req.params['codigo'];

    Usuario.findOne({ email: email }, (err, user) => {
        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } else {
            if (user.recovery_token == codigo) {
                res.status(200).send({ data: true });
            } else {
                res.status(200).send({ data: false });
            }
        }
    });
}

function change_password(req, res) {
    var email = req.params['email'];
    var params = req.body;
    Usuario.findOne({ email: email }, (err, user) => {
        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } else {
            if (user == null) {
                res.status(500).send({ message: "El correo electrónico no se encuentra registrado, intente nuevamente." });
            } else {
                bcrypt.hash(params.password, null, null, function(err, hash) {
                    Usuario.findByIdAndUpdate({ _id: user._id }, { password: hash }, (err, user_update) => {
                        res.status(200).send({ data: user_update });
                    });
                });

            }
        }
    });
}



function newest(req, res) {
    Usuario.find().sort({ createdAt:-1 }).limit(4).exec((err, usuarios) => {
        if (usuarios) {
            res.status(200).send({ usuarios: usuarios });
        }
    });

}


const listarProfileUsuario = (req, res) => {
    var id = req.params['_id'];
    Usuario.find({ profile: id }, (err, usuario_data) => {
        if (!err) {
            if (usuario_data) {
                res.status(200).send({ usuario: usuario_data });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    }).populate('profile');
}



const cambiarAMiembro = async(req, res = response) => {
    var id = req.params['id'];
    // console.log(id);
    Usuario.findByIdAndUpdate({ _id: id }, { role: 'MEMBER' }, (err, usuario_data) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            if (usuario_data) {
                res.status(200).send({ usuario: usuario_data });
            } else {
                res.status(403).send({ message: 'No se actualizó el usuario, vuelva a intentar nuevamente.' });
            }
        }
    })
};


module.exports = {
    getUsuariosList,
    crearUsuarios,
    crearEditor,
    actualizarUsuario,
    actualizarUAdmin,
    borrarUsuario,
    getUsuario,
    getAllUsers,
    set_token_recovery,
    verify_token_recovery,
    change_password,
    newest,
    getAllEditores,
    listarProfileUsuario,
    cambiarAMiembro
};