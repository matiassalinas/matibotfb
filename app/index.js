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
* Se utiliza una function callback ya que algunas respuestas se generan en base a alguna api externa.
*/
function receiveMessage(event){
    var sender = event.sender.id;
    var msg = event.message.text;
    evaluateMessage(msg, function(newMsg){
        if(Object.keys(newMsg).length > 0 ) {
            sendMessage(sender, newMsg);
        }
    });
    
    
}

/*
* Evaluamos el mensaje recibido del usuario, y generamos las respuestas correspondientes
*/
function evaluateMessage(message, callback){
    var newMessage = new Object();
    if(contain(message, 'hola')){
        newMessage.text = 'Hola, ¿Cómo estas?';
    } else if(contain(message, 'imagen') && contain(message, 'random')){
        newMessage.url = 'http://lorempixel.com/400/200/';
        newMessage.text = 'Aquí tienes una imagen random';
    } else if(contain(message, 'euro')){
        euroPeso(function(result){
            newMessage.text = "El valor actual del euro es de $" + result + " pesos chilenos";
            callback(newMessage);
        })
    } else if(contain(message, 'info')){
        var buttons = [{
                type : "web_url",
                url : "https://github.com/matiassalinas",
                title : "GitHub"
            }];
        newMessage.template = {
                title : "Matías Salinas Soto",
                subtitle : "Estudiante de Ingeniería Civil en Informática",
                item_url : "https://github.com/matiassalinas",
                image_url : "https://avatars0.githubusercontent.com/u/18743633?v=3&s=460",
                buttons : buttons
            };
    } else{
        newMessage.text = 'No entiendo lo que dices.';
    }
    callback(newMessage);
}

/*
* Ejemplo de uso de API Externa.
* El resultado es el valor del euro en pesos chilenos.
*/
function euroPeso(callback){
    request('http://mindicador.cl/api',
        function(error, res, data){
            if(error) console.log('Error en euroPeso API');
            else{
                var response = JSON.parse(data);
                callback(response.euro.valor);
            }
        }
    );
}

/*
* Se revisa si el mensaje tiene texto, url de una imagen y/o template para mostrar. 
*/
function sendMessage(sender, newMessage){
    var message = new Object();
    if(newMessage.text != null){
        message = {
            text : newMessage.text
        };
        sendData(sender, message);
    }
    if(newMessage.url != null){
        message = {
           attachment : {
               type : 'image',
               payload: {
                  url: newMessage.url
               }
           }
        };
        sendData(sender, message);
    }
    if(newMessage.template != null){
        message = {
           attachment : {
               type : 'template',
               payload : {
                    template_type : 'generic',
                    elements : [newMessage.template]
               }
           }
        };
        sendData(sender, message);
    }
}

/*
* Se genera la estructura del mensaje que requiere la API de Facebook para enviar mensajes.
*/
function sendData(sender, message){
    var data = {
        recipient: {
            id : sender
        },
        message
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