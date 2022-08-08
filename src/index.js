import { query } from 'cantil';
import 'bootstrap/dist/css/bootstrap.min.css';

const button = query('button[type="submit"]');
const prisionersInput = query('input[name="prisioners"]');
const methodInput = query('select');
const simulationsInput = query('input[name="simulations"]');
const results = query('.results');
let orderedBoxes;

// simulation variables
let totalPrisioners;
let numberOfTries;
let boxes;

const apply = {
  loop: () => {
    // loop over prisioners
    for (let i = 0; i < totalPrisioners; i += 1) {
      let succeed = false;
      let position = i;
      for (let j = 0; j < numberOfTries; j += 1) {
        position = boxes[position];
        if (position === i) {
          succeed = true;
          break;
        }
      }
      if (!succeed) {
        return 0;
      }
    }
    return 1;
  },
  random: () => {
    let allPrisionerSucceed = true;

    // loop over prisioners
    for (let i = 0; i < totalPrisioners; i += 1) {
      const prisionerBoxes = [...boxes];
      let prisionerSucceed = false;
      for (let j = 0; j < numberOfTries; j += 1) {
        const randomPosition = parseInt(Math.random() * prisionerBoxes.length, 10);
        prisionerSucceed ||= prisionerBoxes[randomPosition] === i;
        prisionerBoxes.splice(randomPosition, 1);

        if (prisionerSucceed) break;
      }

      allPrisionerSucceed &&= prisionerSucceed;
      if (!allPrisionerSucceed) break;
    }

    return allPrisionerSucceed;
  },
};

const randomBoxes = () => {
  const result = orderedBoxes.slice(0);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const calc = () => new Promise(resolve => {
  totalPrisioners = parseInt(prisionersInput.value, 10);
  numberOfTries = parseInt(totalPrisioners / 2, 10);
  orderedBoxes = Array.from(Array(totalPrisioners).keys());

  let successCount = 0;
  for (let i = 0; i < simulationsInput.value; i += 1) {
    boxes = randomBoxes();
    successCount += apply[methodInput.value]();
  }

  resolve(successCount);
});

// button click
button.onclick = () => {
  button.disabled = true;
  const startTime = performance.now();

  calc()
    .then(successCount => {
      results.query('.success').innerText = successCount;
      results.query('.samples').innerText = simulationsInput.value;
      results.query('.percent').innerText = ((successCount * 100) / simulationsInput.value).toFixed(4);
      results.query('.performance').innerText = ((performance.now() - startTime) / 1000).toFixed(4);

      button.disabled = false;
    });
};
