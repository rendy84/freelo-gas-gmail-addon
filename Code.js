function buildAddOn(e, projectId, tasklistId) {
  var freeloData = Freelogaslib.libFreeloGetProjects();
  //
  // Project select
  //
  var projectSelect = createSelectionInput("Projekt", "dropdown_project", "projectSelected", projectId, freeloData);
  var tasklistSelect = null;
  if (projectId !== undefined)
    tasklistSelect = createSelectionInput("To-Do list", "dropdown_tasklist", "tasklistSelected", tasklistId, ((freeloData.filter(function (el) { return el.id == projectId; }))[0]).tasklists);
  else
    tasklistSelect = CardService.newTextParagraph().setText("Vyberte projekt");
  var saveButton = undefined;
  if (tasklistId !== undefined) {
    saveButton = CardService.newTextButton()
    .setText("Vytvořit úkol")
    .setOnClickAction(CardService.newAction()
      .setFunctionName("createTask")
    );
  } else {
    saveButton = CardService.newTextParagraph().setText("Vyberte To-Do list");
  }
  
  //
  // Section
  //
  var section = CardService.newCardSection()
    .addWidget(projectSelect)
    .addWidget(tasklistSelect)
    .addWidget(saveButton);
  
  //
  // Section Nastaveni
  //
  var cred = Freelogaslib.libFreeloGetCredentials();
  var user = cred.username;
  var key = cred.apikey;
  var sectionNastaveni = CardService.newCardSection()
    .addWidget(
      CardService.newTextInput()
        .setFieldName("text_input_api_key")
        .setTitle("Freelo API key")
        .setHint("Vložte API key, který naleznete v nastavení Freela")
        .setValue(key)
    )
    .addWidget(
      CardService.newTextInput()
        .setFieldName("text_input_user_name")
        .setTitle("Freelo API username")
        .setHint("Vložte Váš přihlašovací email")
        .setValue(user)
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Uložit")
        .setOnClickAction(
          CardService.newAction().setFunctionName("saveSettings")
        )
    );
  
  //
  // Card
  //
  var card0 = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle('Email -> Freelo úkol')
        .setImageUrl('https://app.freelo.cz/front/images/icons/favicon-32x32.png')
    )
    .addSection(section)
    .build();
  
  var card1 = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle('Nastavení')
        .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/settings_black_48dp.png')      
    )
    .addSection(sectionNastaveni)
    .build();
  
  return [card0, card1];   
}

function createSelectionInput(title, fname, fn, selId, data) {
  var dropdown = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle(title)
    .setFieldName(fname)
    .setOnChangeAction(CardService.newAction().setFunctionName(fn))
    .addItem("Vyberte", "-1", selId === undefined);
  
  for (var i=0; i<data.length; i++)
    dropdown.addItem(data[i].name, data[i].id, data[i].id == selId);
  
  return dropdown;
}



function projectSelected(e) {
  var projectId = e.formInputs.dropdown_project;    
  var nav = CardService.newNavigation().updateCard((buildAddOn(null, projectId, null))[0]);
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}



function tasklistSelected(e) {
  var projectId = e.formInputs.dropdown_project;
  var tasklistId = e.formInputs.dropdown_tasklist;
  var nav = CardService.newNavigation().updateCard((buildAddOn(null, projectId, tasklistId))[0]);
  return CardService.newActionResponseBuilder()
    .setNavigation(nav)
    .build();
}

function saveSettings(e) {
  var user = e.formInputs.text_input_user_name;
  var key = e.formInputs.text_input_api_key;
  Freelogaslib.libFreeloSetCredentials(user, key);
}

function createTask(e) {
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  var messageId = e.messageMetadata.messageId;
  var name = GmailApp.getMessageById(messageId).getSubject();
  var content = "https://mail.google.com/mail/u/0/#inbox/" + messageId;
  
  var projectId = parseInt(e.formInputs.dropdown_project);
  var tasklistId = parseInt(e.formInputs.dropdown_tasklist);
  
  Freelogaslib.libFreeloCreateTask(projectId, tasklistId, name, content);
  
}