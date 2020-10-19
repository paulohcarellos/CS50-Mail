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
  document.querySelector('#inbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
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
  .then(() => load_mailbox('sent'));

  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#inbox-view').style.display = 'block';

  // Show the mailbox name
  const inboxDiv = document.querySelector('#inbox-view');
  inboxDiv.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      if(emails.length > 0){

        const inboxList = document.createElement('div');
        inboxList.setAttribute('class', 'list-group');    

        emails.forEach(email => {
          const inboxMail = document.createElement('button');
          inboxMail.setAttribute('class', 'list-group-item list-group-item-action');
          inboxMail.innerHTML = `<b class='list-group-item-sender'>${(mailbox === 'sent') ? email.recipients : email.sender}</b>
            <span class='list-group-item-subject'>${email.subject}</span>
            <span class='list-group-item-timestamp'>${email.timestamp}</span>`

          if (email.read || mailbox != 'inbox') {
            inboxMail.style.backgroundColor = '#F8F9FA';
          }

          inboxMail.addEventListener('click', () => read_email(email.id, mailbox))
          inboxList.append(inboxMail);
        });

        inboxDiv.append(inboxList);
      }  
  });
}

function read_email(id, mailbox) {

  document.querySelector('#inbox-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  const reply = document.querySelector('#reply');
  const archive = document.querySelector('#archive');

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    let recipients = '';

    email.recipients.forEach(recipient => {
      recipients += recipient + ', ';
    });

    document.querySelector('#email-subject').innerHTML = email.subject;
    document.querySelector('#email-from').innerHTML = email.sender;
    document.querySelector('#email-to').innerHTML = recipients.slice(0,-2);
    document.querySelector('#email-date').innerHTML = email.timestamp;
    document.querySelector('#email-body').innerHTML = email.body;

    reply.addEventListener('click', () => reply_email(email.sender, email.subject, email.timestamp, email.body), {once: true})
  });

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  if (mailbox === 'inbox') {
    archive.innerHTML = 'Archive'
    archive.addEventListener('click', () => archive_email(id, true), {once: true});
  }
  else {
    archive.innerHTML = 'Unarchive'
    archive.addEventListener('click', () => archive_email(id, false), {once: true});
  }
}

function archive_email(id, value) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: value
    })
  })
  .then(() => load_mailbox(value ? 'archive' : 'inbox'));
}

function reply_email(recipient, subject, body, timestamp) {

  document.querySelector('#inbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = `Re: ${subject}`;
  document.querySelector('#compose-body').value = `${body}\n\n${timestamp}`;
}