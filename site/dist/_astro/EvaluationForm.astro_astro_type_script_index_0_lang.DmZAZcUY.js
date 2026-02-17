const g=["Corsair","G.Skill","Kingston","Crucial","Samsung","SK Hynix","Micron","ADATA","Team","Patriot","HyperX","Mushkin","GeIL"],h={DDR3:{min:800,max:2133},DDR4:{min:1600,max:3200},DDR5:{min:3200,max:6400}},b=[1,2,4,8,16,32,64,128];function M(e){const t=[];if(e.type?["DDR3","DDR4","DDR5"].includes(e.type)||t.push({field:"type",message:"RAM type must be DDR3, DDR4, or DDR5"}):t.push({field:"type",message:"RAM type is required"}),e.capacity?!Number.isInteger(e.capacity)||e.capacity<=0?t.push({field:"capacity",message:"Capacity must be a positive integer"}):b.includes(e.capacity)||t.push({field:"capacity",message:`Capacity must be one of: ${b.join(", ")} GB`}):t.push({field:"capacity",message:"Capacity is required"}),!e.speed)t.push({field:"speed",message:"Speed is required"});else if(!Number.isInteger(e.speed)||e.speed<=0)t.push({field:"speed",message:"Speed must be a positive integer"});else if(e.type&&h[e.type]){const i=h[e.type];(e.speed<i.min||e.speed>i.max)&&t.push({field:"speed",message:`Speed for ${e.type} must be between ${i.min} and ${i.max} MHz`})}return e.brand?typeof e.brand!="string"||e.brand.trim().length===0?t.push({field:"brand",message:"Brand must be a non-empty string"}):g.includes(e.brand)||t.push({field:"brand",message:`Unknown brand. Known brands: ${g.join(", ")}`}):t.push({field:"brand",message:"Brand is required"}),e.condition?["new","excellent","good","fair"].includes(e.condition)||t.push({field:"condition",message:"Condition must be new, excellent, good, or fair"}):t.push({field:"condition",message:"Condition is required"}),e.quantity?!Number.isInteger(e.quantity)||e.quantity<=0?t.push({field:"quantity",message:"Quantity must be a positive integer"}):e.quantity>100&&t.push({field:"quantity",message:"Quantity cannot exceed 100 modules"}):t.push({field:"quantity",message:"Quantity is required"}),{isValid:t.length===0,errors:t}}function v(e){const t=[];if(e.name?typeof e.name!="string"||e.name.trim().length===0?t.push({field:"name",message:"Name must be a non-empty string"}):e.name.trim().length<2&&t.push({field:"name",message:"Name must be at least 2 characters long"}):t.push({field:"name",message:"Name is required"}),e.email?typeof e.email!="string"?t.push({field:"email",message:"Email must be a string"}):/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)||t.push({field:"email",message:"Email format is invalid"}):t.push({field:"email",message:"Email is required"}),!e.phone)t.push({field:"phone",message:"Phone number is required"});else if(typeof e.phone!="string")t.push({field:"phone",message:"Phone number must be a string"});else{const i=e.phone.replace(/[\s\-\(\)\+]/g,"");/^\d{10,15}$/.test(i)||t.push({field:"phone",message:"Phone number must contain 10-15 digits"})}return e.preferredContact?["email","phone","either"].includes(e.preferredContact)||t.push({field:"preferredContact",message:"Preferred contact must be email, phone, or either"}):t.push({field:"preferredContact",message:"Preferred contact method is required"}),e.location?typeof e.location!="string"||e.location.trim().length===0?t.push({field:"location",message:"Location must be a non-empty string"}):e.location.trim().length<2&&t.push({field:"location",message:"Location must be at least 2 characters long"}):t.push({field:"location",message:"Location is required"}),{isValid:t.length===0,errors:t}}const I={DDR3:{basePricePerGB:8,speedMultipliers:{800:.7,1066:.8,1333:.9,1600:1,1866:1.1,2133:1.2}},DDR4:{basePricePerGB:12,speedMultipliers:{1600:.7,2133:.8,2400:.9,2666:1,2933:1.1,3200:1.2}},DDR5:{basePricePerGB:18,speedMultipliers:{3200:.8,4800:.9,5600:1,6e3:1.1,6400:1.2}}},q={Corsair:1.15,"G.Skill":1.12,Kingston:1.05,Crucial:1.08,Samsung:1.2,"SK Hynix":1.1,Micron:1.08,ADATA:.95,Team:.9,Patriot:.92,HyperX:1.1,Mushkin:.95,GeIL:.88},A={new:1,excellent:.85,good:.7,fair:.5},R={demandMultiplier:1.25,supplyMultiplier:.95,seasonalMultiplier:1.05},x={1:.8,2:.9,4:1,8:1.05,16:1.1,32:1.15,64:1.2,128:1.25};function C(e,t){const i=I[e].speedMultipliers,n=Object.keys(i).map(Number).sort((r,s)=>r-s);let o=n[0],a=Math.abs(t-o);for(const r of n){const s=Math.abs(t-r);s<a&&(a=s,o=r)}return i[o]}function P(e){const i=I[e.type].basePricePerGB,n=C(e.type,e.speed),o=q[e.brand]||1,a=A[e.condition],r=x[e.capacity]||1;return i*e.capacity*n*o*a*r}function T(e){const{demandMultiplier:t,supplyMultiplier:i,seasonalMultiplier:n}=R;return e*t*i*n}function $(e){const i=Math.max(0,e*.85),n=e*(1+.15);return{min:Math.round(i*100)/100,max:Math.round(n*100)/100}}function B(e){const t=[];t.push(`${e.type} base pricing applied`);const i=C(e.type,e.speed);i>1?t.push(`High speed (${e.speed}MHz) premium applied`):i<1&&t.push(`Lower speed (${e.speed}MHz) discount applied`);const n=q[e.brand]||1;n>1?t.push(`Premium brand (${e.brand}) bonus applied`):n<1&&t.push(`Budget brand (${e.brand}) adjustment applied`),e.condition!=="new"&&t.push(`Used condition (${e.condition}) adjustment applied`);const o=x[e.capacity]||1;return o>1?t.push(`High capacity (${e.capacity}GB) premium applied`):o<1&&t.push(`Low capacity (${e.capacity}GB) discount applied`),t.push("Current market demand adjustment applied"),e.quantity>1&&t.push(`Bulk quantity (${e.quantity} modules) considered`),t}function N(e){const t=P(e),n=T(t)*e.quantity;return Math.round(n*100)/100}function k(e){const t=N(e),i=$(t),n=B(e);let o;return e.quantity===1?o="Response within 2-4 hours":e.quantity<=5?o="Response within 4-8 hours":o="Response within 8-24 hours for bulk evaluation",{estimatedValue:t,priceRange:i,factors:n,timeline:o,nextSteps:["Our team will review your RAM specifications","We will verify current market conditions","You will receive a formal purchase offer","Upon acceptance, we will arrange pickup or shipping"]}}function L(){const e=Date.now().toString(36),t=Math.random().toString(36).substring(2,9);return`RAM-${e}-${t}`.toUpperCase()}function _(){const e="ram_submission_timestamps";try{const n=localStorage.getItem(e),o=n?JSON.parse(n):[],a=Date.now(),r=o.filter(s=>a-s<36e5);if(r.length>=3){const s=Math.min(...r);return{allowed:!1,retryAfter:Math.ceil((s+36e5-a)/1e3/60)}}return r.push(a),localStorage.setItem(e,JSON.stringify(r)),{allowed:!0}}catch(n){return console.warn("Rate limiting unavailable:",n),{allowed:!0}}}function Q(e){const t=[/viagra|cialis|casino|lottery|winner/i,/\b(http|https):\/\//gi,/(.)\1{10,}/],i=`${e.name} ${e.email} ${e.location}`;return t.some(n=>n.test(i))}function F(e){try{const t="ram_submissions",i=localStorage.getItem(t),n=i?JSON.parse(i):[];n.length>=10&&n.shift(),n.push(e),localStorage.setItem(t,JSON.stringify(n))}catch(t){console.error("Failed to store submission locally:",t)}}async function O(e){try{return await new Promise(t=>setTimeout(t,500)),console.log("Quote submission ready for backend processing:",{submissionId:e.submissionId,timestamp:e.timestamp,contact:{name:e.contact.name,email:e.contact.email,preferredContact:e.contact.preferredContact},quote:{estimatedValue:e.quote.estimatedValue,timeline:e.quote.timeline}}),!0}catch(t){return console.error("Failed to send notification:",t),!1}}async function V(e,t,i){const n=_();if(!n.allowed)return{success:!1,message:`Too many submissions. Please try again in ${n.retryAfter} minutes.`,error:"RATE_LIMIT_EXCEEDED"};if(Q(t))return{success:!1,message:"Your submission was flagged as suspicious. Please contact us directly.",error:"SPAM_DETECTED"};const o={ramSpec:e,contact:t,quote:i,timestamp:new Date().toISOString(),submissionId:L()};return F(o),await O(o)?{success:!0,submissionId:o.submissionId,message:"Your quote request has been submitted successfully!"}:{success:!1,message:"Failed to send notification. Please try again or contact us directly.",error:"NOTIFICATION_FAILED"}}const l=document.getElementById("ram-evaluation-form"),u=document.getElementById("loading-state"),c=document.getElementById("quote-results"),E=document.getElementById("clear-form"),S=document.getElementById("new-quote"),d=document.getElementById("accept-quote");let m=null;function G(){if(!l)return;l.querySelectorAll("input, select").forEach(t=>{t.addEventListener("blur",()=>H(t)),t.addEventListener("input",()=>y(t))})}function H(e){const t=e.name;y(e);const i=f();if(i){if(["type","capacity","speed","brand","condition","quantity"].includes(t)){const o=M(i.ramSpec).errors.find(a=>a.field===t);o&&p(e,o.message)}else if(["name","email","phone","preferredContact","location"].includes(t)){const o=v(i.contact).errors.find(a=>a.field===t);o&&p(e,o.message)}}}function p(e,t){e.classList.add("error");const i=document.getElementById(`${e.name}-error`);i&&(i.textContent=t)}function y(e){e.classList.remove("error");const t=document.getElementById(`${e.name}-error`);t&&(t.textContent="")}function D(){if(!l)return;l.querySelectorAll("input, select").forEach(t=>y(t))}function f(){if(!l)return null;const e=new FormData(l),t=a=>{const r=e.get(a);return typeof r=="string"?r:""},i=a=>{const r=t(a),s=parseInt(r,10);return isNaN(s)?0:s},n={type:t("type")||void 0,capacity:i("capacity")||void 0,speed:i("speed")||void 0,brand:t("brand")||void 0,condition:t("condition")||void 0,quantity:i("quantity")||void 0},o={name:t("name")||void 0,email:t("email")||void 0,phone:t("phone")||void 0,preferredContact:t("preferredContact")||void 0,location:t("location")||void 0};return{ramSpec:n,contact:o}}function j(){const e=f();if(!e)return!1;const{ramSpec:t,contact:i}=e,n=M(t),o=v(i);return n.errors.forEach(a=>{if(!l)return;const r=l.querySelector(`[name="${a.field}"]`);r&&p(r,a.message)}),o.errors.forEach(a=>{if(!l)return;const r=l.querySelector(`[name="${a.field}"]`);r&&p(r,a.message)}),n.isValid&&o.isValid}function U(e){const t=document.getElementById("quote-value"),i=document.getElementById("quote-range"),n=document.getElementById("quote-timeline"),o=document.getElementById("quote-factors"),a=document.getElementById("quote-next-steps");t&&(t.textContent=`$${e.estimatedValue.toFixed(2)}`),i&&(i.textContent=`$${e.priceRange.min.toFixed(2)} - $${e.priceRange.max.toFixed(2)}`),n&&(n.textContent=e.timeline),o&&(o.innerHTML="",e.factors.forEach(r=>{const s=document.createElement("li");s.textContent=r,o.appendChild(s)})),a&&(a.innerHTML="",e.nextSteps.forEach(r=>{const s=document.createElement("li");s.textContent=r,a.appendChild(s)})),c&&(c.style.display="block",c.style.opacity="0",c.style.transform="translateY(20px)",setTimeout(()=>{c.style.transition="opacity 0.5s ease, transform 0.5s ease",c.style.opacity="1",c.style.transform="translateY(0)"},100),c.scrollIntoView({behavior:"smooth"})),W()}function W(){const e=document.createElement("div");e.innerHTML=`
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #38a169;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 999;
        font-weight: 500;
      ">
        ✓ Quote generated successfully!
      </div>
    `,document.body.appendChild(e),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},3e3)}async function K(e){if(e.preventDefault(),D(),!!j()){u&&(u.style.display="block"),c&&(c.style.display="none");try{const t=f();if(!t)throw new Error("Unable to get form data");const{ramSpec:i}=t;if(!i.type||!i.capacity||!i.speed||!i.brand||!i.condition||!i.quantity)throw new Error("Incomplete RAM specification");await new Promise(a=>setTimeout(a,1500));const n={type:i.type,capacity:i.capacity,speed:i.speed,brand:i.brand,condition:i.condition,quantity:i.quantity},o=k(n);m=o,u&&(u.style.display="none"),U(o)}catch(t){console.error("Error generating quote:",t),u&&(u.style.display="none"),alert("Sorry, there was an error generating your quote. Please try again.")}}}function Y(){l&&(l.reset(),D(),c&&(c.style.display="none"),m=null)}function z(){c&&(c.style.display="none"),m=null,l&&l.scrollIntoView({behavior:"smooth"})}async function J(){if(!m)return;const e=f();if(!e)return;const{ramSpec:t,contact:i}=e;if(!t.type||!t.capacity||!t.speed||!t.brand||!t.condition||!t.quantity){alert("Missing RAM specification data. Please refresh and try again.");return}if(!i.name||!i.email||!i.phone||!i.preferredContact||!i.location){alert("Missing contact information. Please refresh and try again.");return}d&&(d.disabled=!0,d.textContent="Submitting...");try{const n={type:t.type,capacity:t.capacity,speed:t.speed,brand:t.brand,condition:t.condition,quantity:t.quantity},o={name:i.name,email:i.email,phone:i.phone,preferredContact:i.preferredContact,location:i.location},a=await V(n,o,m);if(a.success){let r="Thank you for accepting our quote! ";switch(o.preferredContact){case"email":r+=`We will contact you via email at ${o.email} within the timeframe specified in your quote.`;break;case"phone":r+=`We will contact you via phone at ${o.phone} within the timeframe specified in your quote.`;break;case"either":r+=`We will contact you via email (${o.email}) or phone (${o.phone}) within the timeframe specified in your quote.`;break}X(r,m.timeline,a.submissionId)}else alert(a.message||"Failed to submit quote request. Please try again.")}catch(n){console.error("Error submitting quote:",n),alert("An error occurred while submitting your quote. Please try again or contact us directly.")}finally{d&&(d.disabled=!1,d.textContent="Accept This Quote")}}function X(e,t,i){const n=`
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      " id="quote-confirmation-overlay">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          margin: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        ">
          <h3 style="color: #38a169; margin-bottom: 1rem; text-align: center;">
            ✓ Quote Accepted Successfully!
          </h3>
          <p style="margin-bottom: 1rem; line-height: 1.5;">
            ${e}
          </p>
          ${i?`
          <div style="
            background: #edf2f7;
            padding: 0.75rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            font-family: monospace;
            font-size: 0.875rem;
            text-align: center;
          ">
            <strong>Reference ID:</strong> ${i}
          </div>
          `:""}
          <div style="
            background: #f7fafc;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            border-left: 4px solid #38a169;
          ">
            <strong>Expected Response Time:</strong> ${t}
          </div>
          <div style="text-align: center;">
            <button onclick="closeQuoteConfirmation()" style="
              background: #3182ce;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
            ">
              Close
            </button>
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",n),window.closeQuoteConfirmation=()=>{const o=document.getElementById("quote-confirmation-overlay");o&&o.remove(),delete window.closeQuoteConfirmation}}function w(){G(),l&&l.addEventListener("submit",K),E&&E.addEventListener("click",Y),S&&S.addEventListener("click",z),d&&d.addEventListener("click",()=>{J().catch(e=>{console.error("Error in accept quote handler:",e)})})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",w):w();
