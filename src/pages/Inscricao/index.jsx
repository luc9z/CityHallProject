import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebaseConnection';
import { addDoc, collection } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import styles from './style.module.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputMask from 'react-input-mask';
import img1 from "../../assets/pics/copastg.jpg";

const ImageButton = ({ onClick, imgSrc, altText }) => (
  <button onClick={onClick} className={styles.imgButton}>
    <img src={imgSrc} alt={altText} className={styles.buttonImage} />
  </button>
);

const Inscricao = () => {
  const navigate = useNavigate();
  const [nomeTime, setNomeTime] = useState('');
  const [inscricaoTipo, setInscricaoTipo] = useState('');
  const [jogadores, setJogadores] = useState([]);
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState(false);

  const validPhone = (phoneNum) => {
    const phoneRegex = /^\(\d{2}\) 9\d{4}-\d{4}$/;
    return phoneRegex.test(phoneNum);
  };

  const validCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove all non-digit characters
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; // Check if the length is 11 or all digits are the same

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const isOver18 = (date) => {
    const eighteenYearsAgo = moment().subtract(18, 'years');
    return moment(date).isBefore(eighteenYearsAgo);
  };

  const handlePhoneInput = (e) => {
    setTelefone(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validPhone(telefone)) {
      toast.error('Por favor, insira um telefone válido no formato (XX) 9XXXX-XXXX.');
      return;
    }

    if (!nomeTime || !inscricaoTipo) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    if (inscricaoTipo.includes('torneio') && jogadores.length < 11) {
      toast.error('Para torneio, são necessários no mínimo 11 jogadores.');
      return;
    }

    if (inscricaoTipo.includes('campeonato') && jogadores.length < 2) {
      toast.error('Para campeonato, são necessários no mínimo 2 jogadores.');
      return;
    }

    const cpfSet = new Set();
    for (let jogador of jogadores) {
      if (!jogador.nome || !jogador.cpf || !jogador.dataNascimento) {
        toast.error('Por favor, preencha todos os campos dos jogadores.');
        return;
      }

      if (!validCPF(jogador.cpf)) {
        toast.error(`CPF inválido para o jogador ${jogador.nome}.`);
        return;
      }

      if (cpfSet.has(jogador.cpf)) {
        toast.error(`CPF duplicado para o jogador ${jogador.nome}.`);
        return;
      }

      if (!isOver18(jogador.dataNascimento)) {
        toast.error(`Jogador ${jogador.nome} deve ter mais de 18 anos.`);
        return;
      }

      cpfSet.add(jogador.cpf);
    }

    try {
      setLoading(true);

      const timeData = {
        nomeTime: nomeTime,
        jogadores: jogadores.map((jogador) => ({
          ...jogador,
          dataNascimento: moment(jogador.dataNascimento).format('YYYY-MM-DD'),
        })),
        celular: telefone,
        tipoEvento: inscricaoTipo,
      };

      await addDoc(collection(db, 'teams'), timeData);

      toast.success('Time registrado com sucesso!');

      setNomeTime('');
      setTelefone('');
      setJogadores([]);
      setInscricaoTipo('');
      setTipoSelecionado(false);
    } catch (error) {
      console.error('Erro ao registrar o time:', error);
      toast.error('Erro ao registrar o time. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddJogador = () => {
    setJogadores([...jogadores, { nome: '', cpf: '', dataNascimento: null }]);
  };

  const handleJogadorChange = (index, field, value) => {
    const newJogadores = [...jogadores];
    newJogadores[index][field] = value;
    setJogadores(newJogadores);
  };

  const handleSelectTipoEvento = (tipo) => {
    setInscricaoTipo(tipo);
    setTipoSelecionado(true);
    if (tipo.includes('torneio') && jogadores.length === 0) {
      setJogadores(new Array(11).fill().map(() => ({
        nome: '',
        cpf: '',
        dataNascimento: null,
      })));
    } else if (tipo.includes('campeonato') && jogadores.length === 0) {
      setJogadores(new Array(2).fill().map(() => ({
        nome: '',
        cpf: '',
        dataNascimento: null,
      })));
    }
  };

  const handleVoltar = () => {
    setTipoSelecionado(false);
    setNomeTime('');
    setTelefone('');
    setJogadores([]);
    setInscricaoTipo('');
  };

  const handleRemoveJogador = (index) => {
    const minJogadores = inscricaoTipo.includes('torneio') ? 11 : 2;
    if (index < minJogadores) {
      return; // Não remove jogadores obrigatórios
    }
    const newJogadores = [...jogadores];
    newJogadores.splice(index, 1);
    setJogadores(newJogadores);
  };

  return (
    <div className={styles.container}>
      <button className={styles.dashboardButton} onClick={() => navigate('/dashboard')}>
        Voltar 
      </button>

      <h2 className={styles.title}>Ficha de Inscrição</h2>
      <ToastContainer />
      {!tipoSelecionado && (
        <div className={styles.tipoEvento}>
          <div className={styles.eventoTorneio}>
            <h4>Torneio</h4>
            <div className={styles.buttonsContainer}>
              <ImageButton onClick={() => handleSelectTipoEvento('torneio1')} imgSrc={img1} altText="Torneio 1" />
              <ImageButton onClick={() => handleSelectTipoEvento('torneio2')} imgSrc={img1} altText="Torneio 2" />
              <ImageButton onClick={() => handleSelectTipoEvento('torneio3')} imgSrc={img1} altText="Torneio 3" />
            </div>
          </div>
          <div className={styles.eventoCampeonato}>
            <h4>Campeonato</h4>
            <div className={styles.buttonsContainer}>
              <ImageButton onClick={() => handleSelectTipoEvento('campeonato1')} imgSrc={img1} altText="Campeonato 1" />
              <ImageButton onClick={() => handleSelectTipoEvento('campeonato2')} imgSrc={img1} altText="Campeonato 2" />
              <ImageButton onClick={() => handleSelectTipoEvento('campeonato3')} imgSrc={img1} altText="Campeonato 3" />
            </div>
          </div>
        </div>
      )}
      {tipoSelecionado && (
        <form onSubmit={handleSubmit}>
          <div className={styles.formgroup}>
            <label htmlFor="nomeTime">Nome do Time:</label>
            <input
              type="text"
              id="nomeTime"
              value={nomeTime}
              onChange={(e) => setNomeTime(e.target.value)}
            />
            <label htmlFor="telefone">Celular:</label>
            <InputMask
              mask="(99) 99999-9999"
              value={telefone}
              onChange={handlePhoneInput}
              className="body-medium text-primary"
              placeholder="(__) 9____-____"
            >
              {(inputProps) => <input {...inputProps} type="text" />}
            </InputMask>
          </div>
          <div className={styles.jogadoresWrapper}>
            {jogadores.map((jogador, index) => (
              <div key={index} className={styles.jogadorWrapper}>
                <div className={styles.jogadorFormgroup}>
                  <label>Nome do Jogador {index + 1}:</label>
                  <input
                    type="text"
                    placeholder="Nome"
                    value={jogador.nome}
                    onChange={(e) => handleJogadorChange(index, 'nome', e.target.value)}
                  />
                  <InputMask
                    mask="999.999.999-99"
                    value={jogador.cpf}
                    onChange={(e) => handleJogadorChange(index, 'cpf', e.target.value)}
                    className="body-medium text-primary"
                    placeholder="___.___.___-__"
                  >
                    {(inputProps) => <input {...inputProps} type="text" />}
                  </InputMask>
                  <label>Data de Nascimento:</label>
                  <DatePicker
                    selected={jogador.dataNascimento}
                    onChange={(date) => handleJogadorChange(index, 'dataNascimento', date)}
                    dateFormat="dd/MM/yyyy"
                    className={styles.datepicker}
                    maxDate={moment().subtract(18, 'years').toDate()} // Data máxima permitida
                    placeholderText="Selecione a data"
                  />
                </div>
                {index >= (inscricaoTipo.includes('torneio') ? 11 : 2) && (
                  <button
                    type="button"
                    onClick={() => handleRemoveJogador(index)}
                    className={styles.removeButton}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className={styles.buttonsContainer}>
            <button type="button" onClick={handleAddJogador}>
              Adicionar Jogador
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Registrar'}
            </button>
            <button type="button" onClick={handleVoltar}>Voltar</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Inscricao;
