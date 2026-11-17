import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { OfertaAcademica } from './oferta-academica.entity';

@Entity('universidades')
export class Universidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column()
  ciudad: string;

  @Column({ type: 'varchar', nullable: true })
  imagenUrl: string | null;

  @OneToMany(() => OfertaAcademica, (oferta) => oferta.universidad)
  ofertas: Relation<OfertaAcademica[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  fechaRegistro: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  fechaActualizacion: Date;
}
