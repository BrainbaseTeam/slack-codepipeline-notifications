const request = require('request');

const SLACK_URL = process.env.SLACK_WEBHOOK_URL;

module.exports.run = (event, context, callback) => {
    request(generateRequestDetails(event, SLACK_URL), function (err, res, body) {
        if (res && (res.statusCode === 200 || res.statusCode === 201)) {
            callback(null, 'Done');
        }
        else {
            console.log('Error: ' + err + ' ' + res + ' ' + body);
            callback('Error');
        }
    });
};

function generateRequestDetails(event, url) {
    if (event['detail-type'] != "CodePipeline Pipeline Execution State Change")
        throw new Error ("Unsupported detail type: " + event['detail-type']);

    let color;
    let text = event.detail.pipeline + " deployment ";
    let pipelineState = event.detail.state;
    if (pipelineState == 'STARTED') {
        color = "#888888";
        text += "has *started* 🎬"
    }
    else if (pipelineState == 'SUCCEEDED') {
        color = "good";
        text += "has *succeeded* 🏁 👍 🎉";
    }
    else if (pipelineState == 'FAILED') {
        color = "danger";
        text += "has *failed* 💀 🔥 🚒 😭";
    }
    else if (pipelineState == 'CANCELED') {
        color = "danger";
        text += "has *stopped* 🛑 ✋";
    }
    else {
        color = "warning";
        text += "has " + pipelineState + " (This is an unknown state to the Slack notifier 👽)";
    }

    //console.log('Posting following message to Slack: ' + text);

    const options = {
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        json: {
            attachments: [ {text: text, color: color}]
        }
    };

    return options;
}
