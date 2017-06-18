var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

//Temporal (poca seguridad tenerlo asi)
const APP_TOKEN = 'EAAZAdHjxuffgBADG0IGMaqAam47cc9n1jYPlcH3kC6MTEGFJmBZCBot7oYFXVJmyYoCLwfM4D4sC98WzJYWw7gwgAEQyK7v2SmYBqmrR26Nje7c2WK53nOwZBMbJ6ZBrCtu24RAe9sJ9BN577iH0ydvO3ZB9KiP0v00ZAZCZCdJOTgZDZD';

//URI FACEBOOK API
const FACEBOOK_URI_API = 'https://graph.facebook.com/v2.6/me/messages';
var app = express();
app.use(bodyParser.json());

app.listen(3000,function(){
    console.log("Conectado a puerto 3000");
});

app.get('/', function(req,res){
    res.send('Bienvenido, estas conectado al puerto 3000');
});


/*
* Webhook de facebook, valida el acceso al servidor con el token y el challenge
*/
app.get('/webhook', function(req,res){
    if(req.query['hub.verify_token'] === 'matibot_token'){
        res.send(req.query['hub.challenge'])
    }else {
        res.send('Acceso inválido.');
    }
});

/*
* Validación de los eventos
*/
app.post('/webhook', function(req,res){
    var data = req.body;
    //console.log(data);
    if(data.object == 'page'){
        data.entry.forEach(function(pageEntry){
            pageEntry.messaging.forEach(function(messagingEvent){
                if(messagingEvent.message){
                    receiveMessage(messagingEvent);
                }
            });  
        });
        //Respondo OK a Facebook. Si no se genera una respuesta, facebook seguirá enviando la misma información.
        res.sendStatus(200);
    }
});

/*
* Se evalua el mensaje recibido, y se envía una respuesta.
*/
function receiveMessage(event){
    //console.log(event);
    var sender = event.sender.id;
    var msg = event.message.text;
    //console.log(sender + " ha enviado: " + msg);
    var newMsg = evaluateMessage(msg);
    
    sendMessage(sender, newMsg);
    
}

/*
* Evaluamos el mensaje recibido del usuario, y generamos las respuestas correspondientes
*/
function evaluateMessage(message){
    var newMessage = '';
    if(contain(message, 'hola')){
        newMessage = 'Hola, ¿Cómo estas?';
    }else{
        newMessage = 'No entiendo lo que dices.';
    }
    return newMessage;
}

/*
* Se genera la estructura del mensaje que requiere la API de Facebook para enviar mensajes.
*/
function sendMessage(sender, message){
    var data = {
        recipient: {
            id : sender
        },
        message: {
            text : message
        }
    };
    callSendAPI(data);
}

/*
* Utilizando el middleware Request hacemos el envío del mensaje al usuario.
*/
function callSendAPI(messageData){
    request({
        uri : FACEBOOK_URI_API,
        qs : {
            access_token : APP_TOKEN
        },
        method : 'POST',
        json : messageData
    }, function(error, res, data){
        if(error) console.log('Error en SendApi Facebook');
        else console.log('Se ha enviado un mensaje.');
    });
}

/*
* Revisamos si la sentencia (mensaje del usuario) contiene la palabra clave. 
*/
function contain(sentence, word){
    sentence = sentence.toUpperCase();
    word = word.toUpperCase();
    return sentence.indexOf(word) >= 0;
}