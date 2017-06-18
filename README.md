# Bot de Facebook con Express.js
## Cómo iniciar el bot
* Crear FanPage en Facebook
* Crear app en https://developers.facebook.com/quickstarts/?platform=web
* Agregar producto: Messenger
* Generar TOKEN de la FanPage
* Cambiar APP_TOKEN de index.js por el token que generaste anteriormente
* Cambiar BOT_TOKEN por uno propio de nuestro bot (cualquiera)
* Iniciar ngrok
```
./ngrok http 3000
```
* Configurar WebHooks
1. Campos de subscripción: 'messages'
2. Colocar la URL que nos entrega ngrok (https), agregarle el get a /webhook, por ejemplo:
```
https://dd75af27.ngrok.io/webhook
```
3. En verificar token colocamos el token que tenemos en BOT_TOKEN
* Iniciar el servicio web
```
node app/index.js
```

Ahora el bot está funcionando correctamente.

## Sentencias actuales del bot

Actualmente el bot tiene 5 sentencias/reglas.

```javascript
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
```

1. Al escribirle a nuestro bot un mensaje con la palabra 'hola', la respuesta será un texto.
2. Cuando se le escriba un mensaje con las palabras 'random' e 'imagen', la respuesta será un texto y una imagen.
3. Cuando reciba un mensaje con la palabra 'euro', la respuesta será el valor actual del Euro en Pesos Chilenos. Este es un ejemplo de como se pueden utilizar API externas en nuestro bot.
4. Si se recibe la palabra 'info', la respuesta será un template.
5. En cualquier otro caso, la respuesta será un texto indicando que no se tiene información para ese mensaje.

## API externa utilizada
En este bot se ha utilizado la API para conocer los principales indicadores económicos para Chile.

[MINDICADOR.CL](http://mindicador.cl/)