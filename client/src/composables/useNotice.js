import { ref } from "vue";
const message = ref("");
let timeout;
export function useNotice() {
  function notify(text) {
    message.value = text;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      message.value = "";
    }, 5000);
  }
  return { message, notify };
}
