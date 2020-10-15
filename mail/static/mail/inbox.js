document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => alert(result));

  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const inboxDiv = document.querySelector('#emails-view');
  inboxDiv.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
      if(emails.length > 0){

        const inboxList = document.createElement('div');
        inboxList.setAttribute('class', 'list-group');    

        emails.forEach(email => {
          let inboxMail = document.createElement('a');
          inboxMail.setAttribute('class', 'list-group-item list-group-item-action');
          inboxMail.setAttribute('href', `/emails/${email.id}`);
          inboxMail.innerHTML = `<span class='list-group-item-sender'>${email.sender}</span>
            <span class='list-group-item-subject'>${email.subject}</span>`

          inboxList.append(inboxMail);
        })

        inboxDiv.append(inboxList);
      }  
  });
}