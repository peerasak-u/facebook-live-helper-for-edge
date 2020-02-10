const elementReady = (selector) => {
    return new Promise((resolve, reject) => {
      let el = document.querySelector(selector);
      if (el) {resolve(el);}
      new MutationObserver((mutationRecords, observer) => {
        // Query for elements matching the specified selector
        Array.from(document.querySelectorAll(selector)).forEach((element) => {
          resolve(element);
          //Once we have resolved we don't need the observer anymore.
          observer.disconnect();
        });
      })
        .observe(document.documentElement, {
          childList: true,
          subtree: true
        });
    });
}

let commentSet = new Set();
let temporarySize = 0;

const commentReader = () => {
    //Pinned comment node
    const pinnedNodes = document.querySelectorAll('.UFILivePinnedCommentLabel');

    //Comment nodes
    const commentNodes = document.querySelectorAll('.UFICommentActorAndBodySpacing');

    //ถ้ามี pinned ให้ถอยมาพิจารณา comment รองสุดท้าย แต่ถ้าไม่มีก็เอาอันสุดท้ายเลย
    const index = (pinnedNodes.length > 0 ? commentNodes.length - 2 : commentNodes.length - 1);

    //ถ้า index แล้วก็เรียก comment node ออกมา
    const commentNode = commentNodes[index];

    //ดึง node ของชื่อและข้อความใน comment
    const customerNameNode = commentNode.querySelector('.UFICommentActorName');
    const commentMessageNode = commentNode.querySelector('.UFICommentBody');

    if (customerNameNode) {
        //ดึงข้อมูลออกมาด้วย innerText และ href ในกรณีที่เป็น facebook profile url
        const name = customerNameNode.innerText;
        const url = customerNameNode.href;
        const message = commentMessageNode.innerText;

        //เก็บไว้ใน comment object
        const comment = { name, message, url }

        //พิจารณาว่า message มันมีตัวเลขอยู่ไหม ถ้ามีถือว่าลูกค้าสนใจ
        //ตรงนี้แก้ไขไปตามเงื่อนไขที่ต้องการได้เลย
        if (/\d+/.test(message.toLowerCase())) {

            //บันทึก comment object ลงใน set เพราะมันจัดการข้อมูลซ้ำให้ได้เองในตัว
            //แต่ต้องเปลี่ยนมันเป็น string กันก่อน ตอนนี้ก็ถือว่าเป็น Set ของ string แล้ว
            commentSet.add(JSON.stringify(comment));

            //add ใส่ set ไปแล้วจำนวนมันมากขึ้นจากเดิมไหม ถ้ามากขึ้นแปลว่ามี comment ใหม่เข้ามา
            if (commentSet.size > temporarySize) {

                //ปรับจำนวนของ size ว่าเปลี่ยนไปแล้วนะ จะได้เอาไว้เทียบกับอีก 500ms ต่อไป
                temporarySize = commentSet.size;
                
                //เรียบร้อยแล้วก็ log ออกมาดูหน่อยว่าได้ผลไหม แต่อันนี้ขอ censor หน่อยเผื่อตอนทำ screenshot จะได้ไม่โดนฟ้อง :3
                console.log({
                    name: `${comment.name.substring(0,4)}...(censor)`,
                    profileUrl: `${comment.url.substring(0,44)}...(censor)`,
                    message: comment.message,
                })
            }
        }
    }

    // วนใหม่อีกใน 0.5 วินาที
    setTimeout(commentReader, 500);
}

elementReady('.UFICommentActorAndBodySpacing').then(() => {
    console.log('Start Recording');
    commentReader();
});