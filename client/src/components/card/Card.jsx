import * as React from 'react';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css'
















export default function Card(params) {

    const [cardData, setCardData] = React.useState({
        cvc: '',
        expiry: '',
        focus: '',
        name: '',
        number: '',
    })

    const handleInputFocus = (e) => {
        setCardData({ focus: e.target.name });
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCardData({ [name]: value });
    }

 
    return <div>
        <div id="PaymentForm">
            <Cards
                cvc={cardData.cvc}
                expiry={cardData.expiry}
                focused={cardData.focus}
                name={cardData.name}
                number={cardData.number}
            />
            <form>
                <input
                    type="tel"
                    name="number"
                    placeholder="Card Number"
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                />
                ...
            </form>
        </div>
    </div>
};
