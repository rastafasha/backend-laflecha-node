const { response } = require('express');
const PaymentMethod = require('../models/tipopago');

const getPaymentMethods = async (req, res) => {

    const paymentMethods = await PaymentMethod.find();

    res.json({
        ok: true,
        paymentMethods
    });
};

const getPaymentMethodName = async (req, res) => {

    const tipo = req.params.tipo;
    const uid = req.uid;

    PaymentMethod.find({ tipo: tipo })
        .exec((err, paymentMethod) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar payment',
                    errors: err
                });
            }
            if (!paymentMethod) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El payment con el tipo ' + tipo + 'no existe',
                    errors: { message: 'No existe un paymentMethod con ese tipo' }
                });

            }
            res.status(200).json({
                ok: true,
                paymentMethod: paymentMethod
            });
        });

};
const getPaymentMethod = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    PaymentMethod.findById(id)
        .exec((err, paymentMethod) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar payment',
                    errors: err
                });
            }
            if (!paymentMethod) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El payment con el id ' + id + 'no existe',
                    errors: { message: 'No existe un paymentMethod con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                paymentMethod: paymentMethod
            });
        });

};

const crearPaymentMethod = async (req, res) => {

    const uid = req.uid;
    const paymentMethod = new PaymentMethod({
        usuario: uid,
        ...req.body
    });

    try {

        const paymentMethodDB = await paymentMethod.save();

        res.json({
            ok: true,
            paymentMethod: paymentMethodDB
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarPaymentMethod = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const payment = await PaymentMethod.findById(id);
        if (!payment) {
            return res.status(500).json({
                ok: false,
                msg: 'paymentMethod no encontrado por el id'
            });
        }

        const cambiosPaymentMethod = {
            ...req.body,
            usuario: uid
        }

        const paymentMethodActualizado = await PaymentMethod.findByIdAndUpdate(id, cambiosPaymentMethod, { new: true });

        res.json({
            ok: true,
            paymentMethodActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin',
        });
    }


};

const borrarPaymentMethod = async (req, res) => {

    const id = req.params.id;

    try {

        const paymentMethod = await PaymentMethod.findById(id);
        if (!paymentMethod) {
            return res.status(500).json({
                ok: false,
                msg: 'paymentMethod no encontrado por el id'
            });
        }

        await PaymentMethod.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'paymentMethod eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

const listarPorUsuario = (req, res) => {
    var id = req.params['id'];
    PaymentMethod.find({ user: id }, (err, data_paymentMethod) => {
        if (!err) {
            if (data_paymentMethod) {
                res.status(200).send({ paymentMethods: data_paymentMethod });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    });
}

const updateStatus = async (req, res) => {
    const id = req.params['id'];
    const { status } = req.body;

    const estadosValidos = ['ACTIVE', 'INACTIVE'];

    // 1. Validar que venga un estado y que esté dentro de la lista permitida
    if (!status || !estadosValidos.includes(status.toUpperCase())) {
        return res.status(400).json({
            ok: false,
            message: `El estado enviado no es válido. Valores permitidos: ${estadosValidos.join(', ')}`
        });
    }

    const estadoFormateado = status.toUpperCase();

    try {
        // 3. Crear el objeto con los datos a actualizar
        const camposAActualizar = {
            status: estadoFormateado
        };

        // 4. CORRECCIÓN CRÍTICA: Pasar todos los campos juntos en el segundo parámetro
        const paymentMethods_data = await PaymentMethod.findByIdAndUpdate(
            id,
            camposAActualizar,      // 👈 Segundo parámetro: Todo lo que se va a modificar
            { new: true }           // 👈 Tercer parámetro: Opciones de Mongoose
        )
            .lean();

        if (!paymentMethods_data) {
            return res.status(404).json({ ok: false, message: 'No se encontró el documento especificado.' });
        }

        return res.status(200).json({
            ok: true,
            paymentMethod: paymentMethods_data
        });



    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Error en el servidor al actualizar el estado' });
    }
}


const listar_active = async (req, res) => {

    PaymentMethod.find({ status: ['ACTIVE'] }).exec((err, paymentMethods_data) => {
        if (err) {
            res.status(500).send({ message: 'Ocurrió un error en el servidor.' });
        } else {
            if (paymentMethods_data) {
                res.status(200).send({ paymentMethods: paymentMethods_data });
            } else {
                res.status(500).send({ message: 'No se encontró ningun dato en esta sección.' });
            }
        }
    });

};




module.exports = {
    getPaymentMethods,
    crearPaymentMethod,
    actualizarPaymentMethod,
    borrarPaymentMethod,
    getPaymentMethod,
    getPaymentMethodName,
    listarPorUsuario,
    updateStatus,
    listar_active,

};